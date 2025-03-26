import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Linking, Image, ScrollView } from "react-native";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "./components/Data_Base_API";
import { Ionicons } from '@expo/vector-icons';

function App() {
    const [currentPath, setCurrentPath] = useState("");
    const [itemsList, setItemsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPopup, setShowPopup] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStorageItems = async (path) => {
        setIsLoading(true);
        try {
            const directoryRef = ref(storage, path);
            const response = await listAll(directoryRef);

            const filePromises = await Promise.all(
                response.items.map(async (item) => ({
                    name: item.name,
                    url: await getDownloadURL(item),
                    type: item.name.split('.').pop().toLowerCase()
                }))
            );

            const sortedItems = filePromises.sort((a, b) => a.name.localeCompare(b.name));
            setItemsList(sortedItems);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStorageItems(currentPath);
    }, [currentPath]);

    const filteredItems = itemsList.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenLink = async (url) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error("Cannot open URL:", error);
        }
    };

    const getFileIcon = (type) => {
        switch(type) {
            case 'pdf':
                return <Ionicons name="document-text" size={24} color="#e74c3c" />;
            case 'epub':
                return <Ionicons name="book" size={24} color="#3498db" />;
            case 'doc':
            case 'docx':
                return <Ionicons name="document" size={24} color="#2c3e50" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <Ionicons name="image" size={24} color="#e67e22" />;
            default:
                return <Ionicons name="document" size={24} color="#95a5a6" />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image 
                    source={{uri: 'https://img.icons8.com/color/96/000000/book-shelf.png'}} 
                    style={styles.logo}
                />
                <Text style={styles.title}>Biblioteca Digital</Text>
            </View>

            {/* Welcome Popup */}
            {showPopup && (
                <View style={styles.popupContainer}>
                    <View style={styles.popup}>
                        <View style={styles.popupHeader}>
                            <Text style={styles.popupTitle}>👋 Bem-vindo à Biblioteca Digital</Text>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Ionicons name="close" size={24} color="#7f8c8d" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.popupContent}>
                            <Text style={styles.popupText}>
                                Explore nosso acervo digital com livros sobre programação, design e tecnologia. 
                                Aqui você encontra recursos para todos os níveis.
                            </Text>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="search" size={18} color="#3498db" />
                                <Text style={styles.featureText}>Busque por título ou autor</Text>
                            </View>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="download" size={18} color="#3498db" />
                                <Text style={styles.featureText}>Visualize os materiais diretamente</Text>
                            </View>
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="star" size={18} color="#3498db" />
                                <Text style={styles.featureText}>Conteúdo selecionado e organizado</Text>
                            </View>
                        </ScrollView>
                        
                        <TouchableOpacity
                            onPress={() => setShowPopup(false)}
                            style={styles.popupButton}
                        >
                            <Text style={styles.popupButtonText}>Explorar Biblioteca</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquise por livros..."
                    placeholderTextColor="#95a5a6"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearch}>
                        <Ionicons name="close-circle" size={20} color="#95a5a6" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Status Info */}
            {isLoading ? (
                <View style={styles.statusContainer}>
                    <Ionicons name="cloud-download" size={24} color="#3498db" />
                    <Text style={styles.statusText}>Carregando biblioteca...</Text>
                </View>
            ) : (
                <Text style={styles.resultsText}>
                    {filteredItems.length} {filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'}
                </Text>
            )}

            {/* Book List */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <View style={styles.itemContent}>
                            <View style={styles.fileIcon}>
                                {getFileIcon(item.type)}
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleOpenLink(item.url)} 
                            style={styles.actionButton}
                        >
                            <Ionicons name="eye" size={20} color="#fff" />
                            <Text style={styles.actionText}>Visualizar</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={48} color="#bdc3c7" />
                            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 10,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c3e50',
    },
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        padding: 20,
    },
    popup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        overflow: 'hidden',
        elevation: 5,
    },
    popupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    popupContent: {
        padding: 16,
    },
    popupText: {
        fontSize: 15,
        color: '#34495e',
        marginBottom: 20,
        lineHeight: 22,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 14,
        color: '#34495e',
        marginLeft: 10,
    },
    popupButton: {
        backgroundColor: '#3498db',
        padding: 16,
        alignItems: 'center',
    },
    popupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#2c3e50',
    },
    clearSearch: {
        padding: 5,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    statusText: {
        marginLeft: 10,
        color: '#7f8c8d',
    },
    resultsText: {
        color: '#7f8c8d',
        marginBottom: 10,
        fontSize: 14,
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 1,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fileIcon: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 3,
    },
    itemType: {
        fontSize: 12,
        color: '#95a5a6',
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    actionButton: {
        backgroundColor: '#3498db',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#bdc3c7',
        fontSize: 16,
        marginTop: 10,
    },
});

export default App;