import { Positions } from "react-native-calendars/src/expandableCalendar";

export default {
  globalcontainer: {
    paddingVertical:10, paddingHorizontal: 15 
  },
  SafeAreaCSS: {
    flex: 1,backgroundColor:'white',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
 
  },
  content: {
    flex: 1,
  },
  footer: {
    height: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footersepet: {
    flexDirection: 'row', minHeight: 70, maxHeight:100, width: '100%', paddingTop: 12, paddingBottom:5, borderTopWidth: 1, borderColor: '#eeeeee', paddingHorizontal: 20
  },  
  butonsepet: {
    flex: 1, backgroundColor: '#417505', borderRadius: 6, alignItems: 'center', justifyContent: 'center',   
  },  
  butonsepetTEXT: {
    color: 'white',fontSize: 16,
    },
    bottomSheet: {
      flex: 1, justifyContent: 'flex-end'
    },
    bottomSheetContainer: {
      width: '100%', height: '100%', paddingHorizontal: 0, paddingVertical: 10,  
      borderTopLeftRadius: 0, borderTopRightRadius: 0 
    },
    bottomSheetcontentStyle: {
      backgroundColor: '#ffffff', // Arka plan rengi
      padding: 15, // İç boşluk
      flex:1
    },
    bottomSheetTitleConatiner: {
      flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5 ,marginTop:5 ,marginBottom:10
       },
    bottomSheetTitle: {
     flex: 1, fontSize: 14, color: 'black' ,textAlign:'center',fontFamily:'NunitoSans-Bold'
    },
    bottomSheetBaklava: {
      alignSelf: 'flex-end', width: 30, height: 30,position:'absolute',right:10    
    },
  }
  ;