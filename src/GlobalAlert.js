// GlobalAlert.js
let alertRef = null;

// App.js içerisindeki ref’i ayarlamak için kullanılacak metod
export const setAlertRef = (ref) => {
  alertRef = ref;
};

// Alert’i göstermek için global çağırılabilir fonksiyon
export const ikostalert = (
  title,
  message,
  buttons = [{ text: 'Tamam', onPress: () => {} }]
) => {
  console.log('ikostalert called, alertRef => ', alertRef);

  if (alertRef) {
    alertRef.showAlert(title, message, buttons);
  } else {
    console.warn('GlobalAlertContainer referansı henüz ayarlanmadı!');
  }
};