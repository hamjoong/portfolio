import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import client from '../api/api';

/**
 * 모바일 앱용 로그인 화면입니다.
 * [이유] 모바일 사용자에게 최적화된 입력 환경과 직관적인 버튼 배치를 통해
 * 서비스 접근성을 높이고 인증 과정을 간소화하기 위함입니다.
 */
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // [참고] 웹과 동일한 백엔드 API 엔드포인트 호출
      const response = await client.post('/auth/login', { email, password });

      if (response.data.success) {
        // [이유] 성공 시 토큰을 안전하게 저장하고 메인 화면으로 이동합니다.
        // 실제 구현 시에는 AsyncStorage 등을 활용하여 토큰을 영속화합니다.
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>PROJECT X</Text>
      <Text style={styles.subtitle}>계정에 로그인하세요</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>로그인</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}> 회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: '900', color: '#2563eb', textAlign: 'center', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  inputContainer: { gap: 12, marginBottom: 24 },
  input: { height: 52, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  loginButton: { height: 56, backgroundColor: '#2563eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b' },
  signupLink: { color: '#2563eb', fontWeight: '700' },
});
