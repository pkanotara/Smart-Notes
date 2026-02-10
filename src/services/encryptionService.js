// 🔒 Simple Encryption Service
// Uses AES-256 encryption to protect your notes

export const encryptionService = {
  
  // 🔐 Encrypt text with a password
  async encrypt(text, password) {
    try {
      // Step 1: Convert text to bytes
      const encoder = new TextEncoder();
      const textBytes = encoder.encode(text);
      
      // Step 2: Create encryption key from password
      const passwordBytes = encoder.encode(password);
      const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);
      
      const key = await crypto.subtle.importKey(
        'raw',
        passwordHash,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Step 3: Generate random IV (initialization vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Step 4: Encrypt the text
      const encryptedBytes = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        textBytes
      );
      
      // Step 5: Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encryptedBytes.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBytes), iv.length);
      
      // Step 6: Convert to base64 string for storage
      return btoa(String.fromCharCode(...combined));
      
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt content');
    }
  },

  // 🔓 Decrypt text with a password
  async decrypt(encryptedText, password) {
    try {
      // Step 1: Convert base64 back to bytes
      const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
      
      // Step 2: Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedBytes = combined.slice(12);
      
      // Step 3: Create decryption key from password
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);
      
      const key = await crypto.subtle.importKey(
        'raw',
        passwordHash,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Step 4: Decrypt the data
      const decryptedBytes = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedBytes
      );
      
      // Step 5: Convert bytes back to text
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBytes);
      
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Incorrect password');
    }
  }
};