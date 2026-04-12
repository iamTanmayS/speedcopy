import React, { useRef } from 'react';
import { 
  StyleSheet, View, Text, Image, 
  TouchableOpacity, Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditorElement, useEditorStore } from '../../state_mgmt/store/editorStore';

interface DraggableElementProps {
  element: EditorElement;
  onEditText?: (id: string, initialValue: string) => void;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ element, onEditText }) => {
  const { 
    selectedElementId, selectElement, updateElement, 
    removeElement, duplicateElement, bringToFront, sendToBack,
    canvasDimensions, setSnapGuides
  } = useEditorStore();
  
  const isSelected = selectedElementId === element.id;

  // Use state for text edit (to be triggered in EditorScreen)
  // But we need a local tap handler
  const lastTap = useRef<number>(0);

  // Standard Animated values
  const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;

  // Re-sync
  React.useEffect(() => {
    pan.setValue({ x: element.x, y: element.y });
  }, [element.x, element.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        selectElement(element.id);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (event, gestureState) => {
        const newX = (pan.x as any)._offset + gestureState.dx;
        const newY = (pan.y as any)._offset + gestureState.dy;

        const centerX = (canvasDimensions.width - element.width) / 2;
        const centerY = (canvasDimensions.height - element.height) / 2;

        let snapX = false;
        let snapY = false;
        let finalX = newX;
        let finalY = newY;

        if (Math.abs(newX - centerX) < 10) {
          finalX = centerX;
          snapX = true;
        }
        if (Math.abs(newY - centerY) < 10) {
          finalY = centerY;
          snapY = true;
        }

        pan.setValue({ x: finalX - (pan.x as any)._offset, y: finalY - (pan.y as any)._offset });
        setSnapGuides({ x: snapX, y: snapY });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        updateElement(element.id, { x: (pan.x as any)._value, y: (pan.y as any)._value });
        setSnapGuides({ x: false, y: false });

        // Handle Tap for Edit
        const now = Date.now();
        if (now - lastTap.current < 300) {
          if (element.type === 'text' && onEditText) {
             onEditText(element.id, element.content);
          }
        }
        lastTap.current = now;
      },
    })
  ).current;

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <Text style={[
            styles.text, 
            { 
              fontSize: element.style?.fontSize || 20,
              color: element.style?.color || '#000',
              fontWeight: (element.style?.fontWeight as any) || '400',
              textAlign: element.style?.textAlign || 'left',
            }
          ]}>
            {element.content}
          </Text>
        );
      case 'image':
        return (
          <Image 
            source={{ uri: element.content }} 
            style={{ width: element.width, height: element.height, borderRadius: element.style?.borderRadius || 0 }}
          />
        );
      case 'shape':
        return (
          <View style={{ 
            width: element.width, 
            height: element.height, 
            backgroundColor: element.style?.color || '#3b82f6',
            borderRadius: element.style?.borderRadius || 0,
            borderWidth: element.style?.borderWidth || 0,
            borderColor: element.style?.borderColor || 'transparent',
          }} />
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      {...panResponder.panHandlers}
      style={[
        styles.elementWrapper,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
          zIndex: element.zIndex,
        },
        isSelected && styles.selectedWrapper
      ]}
    >
      {renderContent()}
      
      {isSelected && (
        <>
          <View style={[styles.handle, styles.topLeft]} />
          <View style={[styles.handle, styles.topRight]} />
          <View style={[styles.handle, styles.bottomLeft]} />
          <View style={[styles.handle, styles.bottomRight]} />
          
          <View style={styles.topControlBar}>
             <TouchableOpacity style={styles.controlIcon} onPress={() => duplicateElement(element.id)}>
                <Ionicons name="copy-outline" size={14} color="#3b82f6" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.controlIcon} onPress={() => bringToFront(element.id)}>
                <Ionicons name="layers-outline" size={14} color="#3b82f6" />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.controlIcon, { backgroundColor: '#fee2e2' }]} onPress={() => removeElement(element.id)}>
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
             </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  elementWrapper: {
    position: 'absolute',
  },
  text: {
    padding: 8,
  },
  selectedWrapper: {
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  handle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 4,
  },
  topLeft: { top: -4, left: -4 },
  topRight: { top: -4, right: -4 },
  bottomLeft: { bottom: -4, left: -4 },
  bottomRight: { bottom: -4, right: -4 },
  topControlBar: {
    position: 'absolute',
    top: -45,
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  controlIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
