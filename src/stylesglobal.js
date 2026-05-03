import { Positions } from "react-native-calendars/src/expandableCalendar";
import { Platform } from 'react-native';
import { colors } from './config/theme';
export default {

  loaderview: {
    flex: 1, alignItems: 'center', justifyContent: 'center'
    , backgroundColor: colors.background,
  },
  loaderview2: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: 60,
  },
  loaderviewPOP: {
    flex: 1, position: 'absolute', width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,.7)',
    alignItems: 'center', justifyContent: 'center'

  },
  loading: {
    width: 100, height: 100
  },
  loading: {
    width: 100, height: 100
  },
  loading2: {
    marginTop: 40,
    width: 100, height: 100
  },
  loading3: {

    width: 50, height: 50
  },
  globalcontainer: {
    paddingVertical: 10, paddingHorizontal: 15
  },
  SafeAreaCSS: {
    flex: 1, backgroundColor: 'white',
  },
  container: {
    flex: 1
    , backgroundColor: colors.white
  },
  basketlistcontainer: {
    flex: 1, padding: 15, paddingTop: 15, paddingBottom: 10
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',

  },
  headerCustom: {

    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.background,
  },
  content: {
    flex: 1,
  },
  footer: {
    height: 65,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footersepet: {
    backgroundColor: 'white',
    flexDirection: 'row', minHeight: 70, maxHeight: 100, width: '100%', paddingTop: 12,
    paddingBottom: 5, borderTopWidth: 1, borderColor: '#eeeeee', paddingHorizontal: 20
  },
  butonsepet: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 6, alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  butonsepetTEXT: {
    color: 'white', fontSize: 13,
    fontFamily: 'NunitoSans-Regular',

  },
  bottomSheet: {
    flex: 1, justifyContent: 'flex-end'
  },
  bottomSheetContainer: {
    width: '100%', height: '100%', paddingHorizontal: 0, paddingVertical: 10,
    borderTopLeftRadius: 0, borderTopRightRadius: 0
  },
  bottomSheetcontentStyle: {
    backgroundColor: colors.white, // Arka plan rengi
    padding: 15, // İç boşluk
    flex: 1
  },
  bottomSheetTitleConatiner: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, marginTop: 5, marginBottom: 10,
    paddingLeft: 45,
  },
  bottomSheetTitle: {
    flex: 1, fontSize: 14, color: 'black', textAlign: 'center', fontFamily: 'NunitoSans-Bold'
  },
  bottomSheetBaklava: {
    alignSelf: 'flex-end', width: 30, height: 30, position: 'absolute', right: 10
  },
}
  ;