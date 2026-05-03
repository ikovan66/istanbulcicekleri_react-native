import React, { Component } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SepetContext } from './SepetContext';
import { colors } from '../config/theme';

class GlobalAlertContainer extends Component {
  static contextType = SepetContext; // Context'i bağla

  state = {
    visible: false,
    title: '',
    message: '',
    buttons: [],
  };

  showAlert = (titleKey, messageKey, buttons = [{ text: 'Tamam', onPress: () => { } }]) => {
    const { translate } = this.context; // Translate fonksiyonunu al

    // Gelen key'leri translate fonksiyonuyla çevir
    const translatedTitle = translate(titleKey);
    const translatedMessage = translate(messageKey);
    const translatedButtons = buttons.map(btn => ({
      text: translate(btn.text),
      onPress: btn.onPress,
    }));

    this.setState({
      visible: true,
      title: translatedTitle,
      message: translatedMessage,
      buttons: translatedButtons,
    });
  };

  hideAlert = () => {
    this.setState({ visible: false });
  };

  render() {
    const { visible, title, message, buttons } = this.state;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertContainerIC}>

              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              <View style={styles.dividerLine} />

              <View style={styles.buttonsContainer}>
                {buttons.map((btn, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      index < buttons.length - 1 && styles.buttonRightBorder
                    ]}
                    onPress={() => {
                      if (btn.onPress) btn.onPress();
                      this.hideAlert();
                    }}
                  >
                    <Text style={styles.buttonText}>{btn.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default GlobalAlertContainer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  alertContainerIC: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.textSecondary,
  },
  title: {
    fontFamily: "NunitoSans-Bold",
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16, color: 'black'
  },
  message: {
    fontFamily: "NunitoSans-Regular",
    fontSize: 13,
    textAlign: 'center',
    color: colors.textDark,
    marginHorizontal: 16,
    marginBottom: 16, color: 'black'
  },
  dividerLine: {
    height: 0.5,
    backgroundColor: colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  buttonRightBorder: {
    borderRightWidth: 0.5,
    borderRightColor: colors.textSecondary,
  },
  buttonText: {
    fontFamily: "NunitoSans-Bold",
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});