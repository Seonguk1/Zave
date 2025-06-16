// 자원 조합 + 도감 + 여정 목표 시스템 포함 (React Native)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Button, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { allResults } from '../src/data/allResults';
import { combinations } from '../src/data/combinations';
import { journey } from '../src/data/journey';
import { resources } from '../src/data/resources';


const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.2;
const ICON_SIZE = ITEM_SIZE * 0.75;


export default function HomeScreen() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [discovered, setDiscovered] = useState([]);
  const [showCodex, setShowCodex] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [unlockedSteps, setUnlockedSteps] = useState(['farming']);

  useEffect(() => {
    const loadDiscovered = async () => {
      try {
        const saved = await AsyncStorage.getItem('discovered');
        if (saved) setDiscovered(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load discovered:', e);
      }
    };
    loadDiscovered();
  }, []);

  useEffect(() => {
    const saveDiscovered = async () => {
      try {
        await AsyncStorage.setItem('discovered', JSON.stringify(discovered));
      } catch (e) {
        console.error('Failed to save discovered:', e);
      }
    };
    if (discovered.length > 0) {
      saveDiscovered();
    }
  }, [discovered]);

  useEffect(() => {
    // 새 단계 자동 해금
    journey.forEach((step, idx) => {
      if (!unlockedSteps.includes(step.id)) {
        const recipeFound = step.recipe.every(r => discovered.includes(r));
        if (recipeFound) {
          setUnlockedSteps(prev => [...prev, step.id]);
        }
      }
    });
  }, [discovered]);

  const handleSelect = (resource) => {
    const next = [...selected, resource].slice(-2);
    setSelected(next);

    if (next.length === 2) {
      const key1 = `${next[0].id}+${next[1].id}`;
      const key2 = `${next[1].id}+${next[0].id}`;
      const combo = combinations[key1] || combinations[key2];
      if (combo) {
        setResult(combo);
        setModalVisible(true);
        if (!discovered.includes(combo.id)) {
          setDiscovered(prev => [...prev, combo.id]);
        }
      } else {
        setResult({
          id: 'fail',
          label: '실패!',
          icon: TEMP_IMAGE,
          description: '이 조합은 아무 일도 일어나지 않았어요…'
        });
        setModalVisible(true);
      }
    }
  };

  const isSelected = (res) => selected.find((s) => s.id === res.id);
  const discoveredItems = allResults.filter(item => discovered.includes(item.id));
  const selectableResources = [...resources, ...discoveredItems];

  if (showJourney) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🧭 여정 보기</Text>
        <ScrollView contentContainerStyle={styles.codexContainer}>
          {journey.map((step) => (
            <View key={step.id} style={styles.codexItem}>
              {unlockedSteps.includes(step.id) ? (
                <>
                  <Image source={TEMP_IMAGE} style={styles.resultIcon} />
                  <Text>{step.label}</Text>
                  <Text style={{ fontSize: 12 }}>레시피: {step.recipe.join(' + ')}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.resultIcon, styles.silhouette]} />
                  <Text>???</Text>
                </>
              )}
            </View>
          ))}
        </ScrollView>
        <Button title="← 돌아가기" onPress={() => setShowJourney(false)} />
      </View>
    );
  }

  if (showCodex) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📘 도감</Text>
        <ScrollView contentContainerStyle={styles.codexContainer}>
          {allResults.map(item => (
            <View key={item.id} style={styles.codexItem}>
              {discovered.includes(item.id) ? (
                <>
                  <Image source={item.icon} style={styles.resultIcon} />
                  <Text>{item.label}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.resultIcon, styles.silhouette]} />
                  <Text>???</Text>
                </>
              )}
            </View>
          ))}
        </ScrollView>
        <Button title="← 돌아가기" onPress={() => setShowCodex(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>합체합체 🔮</Text>
      <Button title="📘 도감 보기" onPress={() => setShowCodex(true)} />
      <Button title="🧭 여정 보기" onPress={() => setShowJourney(true)} />
      <View style={styles.resourceRow}>
        {selectableResources.map((res) => (
          <TouchableOpacity
            key={res.id}
            onPress={() => handleSelect(res)}
            style={[styles.resourceIcon, isSelected(res) && styles.selectedIconBox]}
          >
            <Image source={res.icon} style={styles.iconImage} />
            <Text style={styles.iconLabel}>{res.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => { setModalVisible(false); setSelected([]); }}>
        <Pressable style={styles.modalContainer} onPress={() => { setModalVisible(false); setSelected([]); }}>
          <Pressable style={styles.resultCard} onPress={(e) => e.stopPropagation()}>
            <Image source={result?.icon} style={styles.resultIcon} />
            <Text style={styles.resultTitle}>{result?.label}</Text>
            <Text style={styles.resultDescription}>{result?.description}</Text>
            <Pressable onPress={() => { setModalVisible(false); setSelected([]); }}>
              <Text style={styles.closeButton}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 30,
    minHeight: 150,
  },
  resourceIcon: {
    alignItems: 'center',
    width: ITEM_SIZE,
    margin: 10,
    padding: 8,
    borderRadius: 8,
  },
  selectedIconBox: {
    backgroundColor: '#e0f7ff',
    borderWidth: 2,
    borderColor: '#00bcd4',
  },
  iconImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  resultIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  codexContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  codexItem: {
    alignItems: 'center',
    width: ITEM_SIZE,
    margin: 10,
  },
  silhouette: {
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
});