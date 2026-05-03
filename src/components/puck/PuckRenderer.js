/**
 * PuckRenderer — Puck JSON → React Native Component Mapper
 * 
 * Puck JSON'daki her "type" için uygun native component'i bulur ve render eder.
 * Bilinmeyen type'lar güvenle atlanır.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import { navigatePuckLink } from './PuckLinkResolver';

// Native Puck Components
import NativeImageBlock from './NativeImageBlock';
import NativeCategories from './NativeCategories';
import NativeCollection from './NativeCollection';
import NativeHeading from './NativeHeading';
import NativeSpacer from './NativeSpacer';
import NativeMarquee from './NativeMarquee';
import NativeBrands from './NativeBrands';
import NativeTestimonials from './NativeTestimonials';
import NativeMasonryCollections from './NativeMasonryCollections';
import NativeCategoriesCosmetic from './NativeCategoriesCosmetic';
import NativeBannerCollection from './NativeBannerCollection';

// Existing components (adapted)
import AnaUrunlist from '../AnaUrunlist';
import AnaUrunlistYatay from '../AnaUrunlistYatay';
import IkostScalableImage from '../IkostScalableImage';
import IkostSwiper from '../IkostSwiper';

const windowWidth = Dimensions.get('window').width;

/**
 * Component Registry — Puck type → React Native component mapping
 * `null` → kasıtlı olarak atlanır (örn: SEO HTML).
 */
const COMPONENT_MAP = {
  // ── Images & Banners ──
  'ImageBlock':              NativeImageBlock,
  'Collection_MultiBrand':   NativeCollection,
  'BannerCountdown_Home5':   NativeImageBlock,

  // ── Masonry / Banner Collections ──
  'MasonryCollections_Handbag': NativeMasonryCollections,
  'BannerCollection_Cosmetic': NativeBannerCollection,

  // ── Hero Sliders ──
  'Hero_Home2':              'HeroSlider',
  'Hero_MultiBrand':         'HeroSlider',
  'Hero_Home1':              'HeroSlider',

  // ── Categories ──
  'Categories_Furniture':    NativeCategories,
  'Categories2_MultiBrand':  NativeCategories,
  'Categories_MultiBrand':   NativeCategories,
  'Categories_Cosmetic':     NativeCategoriesCosmetic,

  // ── Products ──
  'Dynamic_ProductList':     'ProductList',

  // ── Text & Layout ──
  'Heading_Basic':           NativeHeading,
  'Spacer':                  NativeSpacer,
  'Marquee_Home1':           NativeMarquee,

  // ── Social Proof ──
  'Brands':                  NativeBrands,
  'Brands_MultiBrand':       NativeBrands,
  'Testimonials_MultiBrand': NativeTestimonials,

  // ── Location ──
  'Location_Search':         'LocationSearch',

  // ── Skipped (web-only / SEO) ──
  'HTMLText':                null,
  'RichText':                null,
  'CodeInjection':           null,
};

/**
 * Render a single Puck block with the matched native component
 */
const PuckBlock = ({ block, navigation }) => {
  const { type, props } = block;
  const Component = COMPONENT_MAP[type];

  // Explicitly skipped
  if (Component === null) return null;

  // Unknown type — skip silently
  if (Component === undefined) {
    return null;
  }

  // ── Special handling for types that need prop transformation ──

  // Hero Sliders → render as swipeable images with link resolution
  if (Component === 'HeroSlider') {
    const slides = props.slides || [];
    if (slides.length === 0) return null;

    const renderSlideItem = ({ item, index }) => (
      <TouchableOpacity
        key={`hero-${index}`}
        onPress={() => {
          const link = item.buttonLink || '';
          if (link) navigatePuckLink(link, navigation, item.title || '');
        }}
        activeOpacity={0.9}
      >
        <IkostScalableImage
          width={windowWidth / (slides.length > 1 ? 1.22 : 1) - 10}
          source={{
            uri: item.src || item.imgSrc || '',
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    );

    return (
      <View style={{ width: windowWidth, marginBottom: 10 }}>
        <IkostSwiper
          data={slides}
          renderItem={renderSlideItem}
          visibleItems={slides.length > 1 ? 1.22 : 1}
          spaceBetween={10}
          autoScroll={true}
          autoScrollInterval={3000}
        />
      </View>
    );
  }

  // Product List → grid or slider based on Puck props
  if (Component === 'ProductList') {
    const products = props.initialProducts || [];
    if (products.length === 0) return null;

    const title = props.title || '';
    const subTitle = props.subTitle || '';
    const showTitle = props.showTitle !== false;
    const showSubTitle = props.showSubTitle === true && subTitle.trim();
    const isSlider = props.isSlider === true;
    const columns = props.columns || 4; // web columns
    // Mobilde: web 4 sütun → 2 sütun, web 3 → 2, web 2 → 2, web 1 → 1
    const mobileColumns = columns >= 2 ? 2 : 1;

    const UrunView = require('../UrunView').default;
    const UrunView1 = require('../UrunView1').default;

    // Başlık
    const titleBlock = (showTitle && title.trim()) ? (
      <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
        <Text style={{
          fontFamily: 'NunitoSans-Bold',
          fontSize: 18,
          color: 'black',
        }}>
          {title}
        </Text>
        {showSubTitle ? (
          <Text style={{
            fontFamily: 'NunitoSans-Regular',
            fontSize: 13,
            color: '#888',
            marginTop: 4,
          }}>
            {subTitle.trim()}
          </Text>
        ) : null}
      </View>
    ) : null;

    // Slider mode
    if (isSlider) {
      return (
        <View>
          {titleBlock}
          <AnaUrunlistYatay urunlist={products} navigation={navigation} />
        </View>
      );
    }

    // Grid mode (2 sütun)
    return (
      <View>
        {titleBlock}
        <FlatList
          scrollEnabled={false}
          data={products}
          numColumns={mobileColumns}
          columnWrapperStyle={mobileColumns > 1 ? { justifyContent: 'space-between' } : null}
          renderItem={({ item }) => (
            mobileColumns === 2
              ? <UrunView item={item} />
              : <UrunView1 item={item} />
          )}
          keyExtractor={(item, index) => `puck-prod-${item.id}-${index}`}
          contentContainerStyle={{ flexGrow: 1 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={12}
          style={{ paddingHorizontal: 5 }}
        />
      </View>
    );
  }

  // Location Search — skip for now (app has its own location flow)
  if (Component === 'LocationSearch') return null;

  // Direct render for all other mapped components
  return <Component {...props} navigation={navigation} />;
};

/**
 * PuckRenderer — renders all blocks from Puck JSON content array
 * Used as a FlatList renderItem function
 */
export const renderPuckBlock = (navigation) => ({ item, index }) => {
  return <PuckBlock block={item} navigation={navigation} />;
};

/**
 * Transform Puck JSON content array into FlatList-ready data
 * Assigns unique keys for FlatList keyExtractor
 */
export function preparePuckData(puckContent) {
  if (!Array.isArray(puckContent)) return [];
  return puckContent.map((block, index) => ({
    ...block,
    _key: block.props?.id || `${block.type}-${index}`,
  }));
}

export default PuckBlock;
