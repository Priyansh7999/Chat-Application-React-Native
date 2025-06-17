import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

export function EditDataModal({ editDetails, setEditDetails, onClose, onSave }) {
    const handleEditDetails = (field, value) => {
        setEditDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.title}>EDIT PROFILE</Text>
                <Pressable onPress={onClose}>
                    <Ionicons name="close" size={24} color="indigo" />
                </Pressable>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>UserName</Text>
                <TextInput
                    value={editDetails.username}
                    style={styles.input}
                    onChangeText={text => handleEditDetails('username', text)}
                />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                    value={editDetails.phone}
                    style={styles.input}
                    onChangeText={text => handleEditDetails('phone', text)}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                    value={editDetails.bio}
                    style={styles.input}
                    onChangeText={text => handleEditDetails('bio', text)}
                />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>City</Text>
                <TextInput
                    value={editDetails.city}
                    style={styles.input}
                    onChangeText={text => handleEditDetails('city', text)}
                />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>State</Text>
                <TextInput
                    value={editDetails.state}
                    style={styles.input}
                    onChangeText={text => handleEditDetails('state', text)}
                />
            </View>

            <Pressable style={styles.saveBtn} onPress={onSave}>
                <Text style={{ color: 'black', fontSize: 20, fontFamily: 'InriaSans-Bold' }}>Save</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: wp(4),
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        marginBottom: wp(2),
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
        color: 'indigo'
    },
    form: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(2),
    },
    label: {
        fontSize: wp(4),
        fontFamily: 'InriaSans-Bold',
        color: 'indigo',
        width: wp(20),
    },
    input: {
        borderWidth: 1,
        borderColor: 'indigo',
        borderRadius: 10,
        padding: wp(2),
        width: wp(50),
        fontSize: wp(4),
        color: 'black',
        fontFamily: 'InriaSans-Regular',
        backgroundColor: '#f8f8ff'
    },
    saveBtn: {
        backgroundColor: '#00DF82',
        borderRadius: 10,
        padding: wp(2),
        alignItems: 'center',
        width: wp(50),
        alignSelf: 'center',
        marginTop: wp(3)
    }
});