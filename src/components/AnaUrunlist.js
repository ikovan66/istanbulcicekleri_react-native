import { StyleSheet, FlatList } from 'react-native';
import UrunView1 from '../components/UrunView1';
import { colors } from '../config/theme';

const AnaUrunlist = ({ urunlist }) => {
  return (
    <FlatList
      scrollEnabled={false}
      data={urunlist}
      renderItem={({ item }) => (
        <UrunView1 item={item} />
      )}
      keyExtractor={(item, index) => `${item.id}-${index}`}
    

        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={30}
        style={{ backgroundColor:colors.white,paddingHorizontal:10}}
        onEndReachedThreshold={0}
    />
  );
};

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
  },
  
 
});

export default AnaUrunlist;
