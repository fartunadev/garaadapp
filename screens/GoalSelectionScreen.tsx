// screens/GoalSelectionScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GoalSelectionScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Waa maxey hadafkaaga ugu weyn?</Text>

      {[
        'Horumarinta xirfadaha',
        'La socoshada cilmiga',
        'Guul dugsiyeyda',
        'Waxbarashada ilmahayga',
        'Caawinta ardaydayda'
      ].map((goal, index) => (
        <TouchableOpacity key={index} style={styles.option}>
          <Text style={styles.optionText}>{goal}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
       style={styles.button}
       onPress={() => navigation.navigate('Signup')}
      >
       <Text style={styles.buttonText}>Sii wad</Text>
     </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {   padding: 20, backgroundColor: '#98c1d9', flex: 1 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 30,  marginTop: 100, },
  option: {
       flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#457b9d',
    padding: 22,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#22577a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,

  },
  optionText: { fontSize: 16 },
  button: {
    marginTop: 30,
    padding: 14,
    backgroundColor: '#62b6cb',
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: { fontWeight: 'bold'},
});
