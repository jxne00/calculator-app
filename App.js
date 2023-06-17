import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';

const screenWidth = Dimensions.get('window').width * 0.85;
const btnWidth = screenWidth / 4;

export default function App() {
  const [answerValue, setAnswerValue] = useState(0);
  const [readyToReplace, setReadyToReplace] = useState(true);
  const [memoryValue, setMemoryValue] = useState(0);
  const [operatorValue, setOperatorValue] = useState(0);

  const [equationValue, setEquationValue] = useState('');
  const [resetEquation, setResetEquation] = useState(false);
  const [resultFontSize, setResultFontSize] = useState(70);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [isScienceMode, setIsScienceMode] = useState(false);
  const [clearButtonText, setClearButtonText] = useState('AC');

  // re-calculates result fontsize when 'answerValue' is changed
  useEffect(() => {
    const maxResultLen = screenWidth / (resultFontSize * 0.6);

    if (answerValue.toString.length > maxResultLen) {
      const newFontSize = screenWidth / (answerValue.toString.length + 1);
      setResultFontSize(newFontSize);
    }
  }, [answerValue, resultFontSize]);

  // update state when respective switch is toggled
  const toggleColorMode = () => setDarkModeEnabled(!darkModeEnabled);
  const toggleScienceMode = () => setIsScienceMode(!isScienceMode);

  // function to handle each button press
  const buttonPressed = (value) => {
    if (clearButtonText === 'AC') {
      if (value === 'AC') return;
      setClearButtonText('C');
    }
    if (!isNaN(value)) {
      setAnswerValue(handleNumber(value));
    }
    if (value === 'C') {
      setAnswerValue(0);
      setMemoryValue(0);
      setOperatorValue(0);
      setReadyToReplace(true);
      setEquationValue('');
      setResetEquation(false);
      setResultFontSize(70);
      setClearButtonText('AC');
    }
    if (['+', '-', 'x', '/', '^2', 'ln', 'log', 'π'].includes(value)) {
      setMemoryValue(operatorValue === 0 ? answerValue : calculateEquals());
      setOperatorValue(value);
      setReadyToReplace(true);
    }
    if (value === '=') {
      if (operatorValue === 0) return;
      calculateEquals();
      setMemoryValue(0);
      setOperatorValue(0);
      setReadyToReplace(true);
      setResetEquation(true);
    }
    if (value === '+/-') {
      const res = answerValue * -1;
      setAnswerValue(res);
      // replace number with its +/- value
      setEquationValue(equationValue.replace(answerValue, res));
    }
    if (value === '%') {
      const res = (answerValue * 0.01).toFixed(5);
      setAnswerValue(handleDecimal(res));
    }
    if (value === '.') {
      setAnswerValue(answerValue + '.');
    }
    if (!['C', '+/-', '+/-'].includes(value)) {
      setEquationValue(handleEquation(value));
    }
  };

  // determine if append to or replace answerValue
  const handleNumber = (number) => {
    if (readyToReplace) {
      setReadyToReplace(false);
      return number;
    } else {
      return answerValue + number;
    }
  };

  // handles calculation of equation
  const calculateEquals = () => {
    const previous = parseFloat(memoryValue);
    const current = parseFloat(answerValue);

    switch (operatorValue) {
      case '+':
        res = previous + current;
        break;
      case '-':
        res = previous - current;
        break;
      case 'x':
        res = previous * current;
        break;
      case '/':
        res = previous / current;
        break;
      case '^2':
        res = current * current;
        break;
      case 'ln':
        res = Math.log(current);
        break;
      case 'log':
        res = Math.log10(current);
        break;
      case 'π':
        res = previous === 0 ? Math.PI : previous * Math.PI;
        break;
      default:
        break;
    }
    res = handleDecimal(res.toFixed(5));
    setAnswerValue(res);
    return res;
  };

  // removes trailing zeros from val
  const handleDecimal = (val) => {
    return val.includes('.') ? val.replace(/\.?0+$/, '') : val;
  };

  // determine if append to or reset equationValue
  const handleEquation = (value) => {
    if (resetEquation) {
      setResetEquation(false);
      return value;
    } else {
      if (value === '^2') {
        return equationValue + '\u00B2';
      }
      if (value === 'x') {
        return equationValue + '*';
      }
      if (value === '/') {
        return equationValue + '\u00F7';
      }
      return equationValue + value;
    }
  };

  // sets up a TouchableOpacity with custom styling
  const NewButton = ({ setStyle, value }) => {
    let buttonStyle = styles.button;
    let bgColor = darkModeEnabled ? '#373737' : '#077563';
    let textColor = '#fff';

    let customHeight = isScienceMode ? btnWidth * 0.8 : btnWidth;
    let customWidth = isScienceMode ? btnWidth / 2 : btnWidth;

    // set custom style based on input
    switch (setStyle) {
      case 'blueBtn':
        bgColor = darkModeEnabled ? '#5a01d8' : '#7f3bdf';
        break;
      case 'orangeBtn':
        bgColor = darkModeEnabled ? '#c05d00' : '#da8433';
        break;
      case 'lgrayBtn':
        bgColor = darkModeEnabled ? '#9e9e9e' : '#afafaf';
        textColor = '#000';
        break;
      case 'longGrayBtn':
        buttonStyle = styles.zeroBtn;
        textColor = '#fff';
        break;
      default:
        break;
    }

    return (
      <TouchableOpacity
        style={[
          buttonStyle,
          {
            backgroundColor: bgColor,
            height: customHeight,
            width: customWidth,
          },
        ]}
        onPress={() => buttonPressed(value)}>
        <Text style={[styles.buttonText, { color: textColor }]}>
          {value == '^2' ? 'x\u00B2' : value}
        </Text>
      </TouchableOpacity>
    );
  };

  // colors to use based on activated theme
  const containerBg = darkModeEnabled ? '#000' : '#ced4c3';
  const eqnColor = darkModeEnabled ? '#b8b8b8' : '#8f8f8f';
  const resultColor = darkModeEnabled ? '#fff' : '#000';
  const statusbarStyle = darkModeEnabled ? 'light' : 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <View style={[styles.container, { backgroundColor: containerBg }]}>
        {/* Equation field */}
        <Text numberOfLines={3} style={[styles.equation, { color: eqnColor }]}>
          {equationValue}
        </Text>

        {/* Result field */}
        <Text
          numberOfLines={2}
          style={[
            styles.resultText,
            { color: resultColor, fontSize: resultFontSize },
          ]}>
          {answerValue}
        </Text>

        {/* switches to toggle between modes */}
        <View style={styles.switchRow}>
          <Switch
            style={styles.switchStyle}
            trackColor={{ true: '#75a8ff', false: '#2b2b2b' }}
            thumbColor={darkModeEnabled ? '#2b2b2b' : '#75a8ff'}
            ios_backgroundColor={darkModeEnabled ? '#75a8ff' : '#2b2b2b'}
            onValueChange={toggleColorMode}
            value={darkModeEnabled}
          />
          <Text style={[styles.switchlabel, { color: resultColor }]}>
            {darkModeEnabled ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch
            style={styles.switchStyle}
            trackColor={{ true: '#d045c7', false: '#762445' }}
            ios_backgroundColor='#60a540'
            onValueChange={toggleScienceMode}
            value={isScienceMode}
          />
          <Text style={[styles.switchlabel, { color: resultColor }]}>
            {isScienceMode ? 'Scientific' : 'Basic'}
          </Text>
        </View>

        {/* setup calculator buttons */}
        <View style={styles.row}>
          <NewButton setStyle='orangeBtn' value={clearButtonText} />
          <NewButton setStyle='lgrayBtn' value='+/-' />
          <NewButton setStyle='lgrayBtn' value='%' />
          <NewButton setStyle='blueBtn' value='/' />
        </View>
        {isScienceMode && (
          // rendered only when science mode is 'ON"
          <View style={styles.row}>
            <NewButton setStyle='lgrayBtn' value='ln' />
            <NewButton setStyle='lgrayBtn' value='log' />
            <NewButton setStyle='lgrayBtn' value='π' />
            <NewButton setStyle='blueBtn' value='^2' />
          </View>
        )}
        <View style={styles.row}>
          <NewButton value='7' />
          <NewButton value='8' />
          <NewButton value='9' />
          <NewButton setStyle='blueBtn' value='x' />
        </View>
        <View style={styles.row}>
          <NewButton value='4' />
          <NewButton value='5' />
          <NewButton value='6' />
          <NewButton setStyle='blueBtn' value='-' />
        </View>
        <View style={styles.row}>
          <NewButton value='1' />
          <NewButton value='2' />
          <NewButton value='3' />
          <NewButton setStyle='blueBtn' value='+' />
        </View>
        <View style={styles.row}>
          <NewButton setStyle='longGrayBtn' value='0' />
          <NewButton value='.' />
          <NewButton setStyle='blueBtn' value='=' />
        </View>
      </View>
      <StatusBar style={statusbarStyle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  resultText: {
    color: '#fff',
    margin: '5%',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: btnWidth / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%',
  },
  zeroBtn: {
    flex: 2,
    width: 2 * (btnWidth + 5),
    borderRadius: screenWidth / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%',
  },
  buttonText: {
    fontSize: 30,
  },
  equation: {
    fontSize: 35,
    margin: '5%',
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  switchStyle: {
    marginBottom: '5%',
    marginLeft: '5%',
  },
  switchlabel: {
    marginTop: '1%',
    marginLeft: '2%',
    marginRight: '3%',
    fontSize: 20,
    fontStyle: 'italic',
  },
});
