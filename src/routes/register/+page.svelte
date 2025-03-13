<script lang="ts">
    import { auth } from '$lib/firebase';
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { goto } from '$app/navigation';
  
    let email = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
  
    async function handleRegister() {
      error = "";
      if (password !== confirmPassword) {
        error = "Passwords do not match.";
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        goto('/'); // Redirect after successful registration
      } catch (e) {
        error = (e as Error).message;
      }
    }
  </script>
  
  <div class="register-container">
    <h2>Register</h2>
  
    {#if error}
      <div class="error">{error}</div>
    {/if}
  
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" bind:value={email} required>
    </div>
  
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required>
    </div>
  
    <div class="form-group">
      <label for="confirm-password">Confirm Password:</label>
      <input type="password" id="confirm-password" bind:value={confirmPassword} required>
    </div>
  
    <button on:click={handleRegister}>Create Account</button>
  </div>
  
  <style>
    .register-container {
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      border-radius: 14px;
      box-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
      width: auto;
      margin: 50px auto;
      padding: 20px;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  
    h2 {
      color: #ff3366;
      text-align: center;
      margin-bottom: 20px;
      text-shadow: 0 0 8px rgba(255, 51, 102, 0.8);
    }
  
    .form-group {
      margin-bottom: 15px;
    }
  
    label {
      display: block;
      margin-bottom: 5px;
      color: #aaa;
    }
  
    input {
      width: 100%;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background-color: rgba(0, 0, 0, 0.3);
      color: #fff;
      transition: border-color 0.3s;
    }
  
    input:focus {
      outline: none;
      border-color: #ff3366;
      box-shadow: 0 0 8px rgba(255, 51, 102, 0.6);
    }
  
    button {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(to right, #ff3366, #ff0044);
      color: #fff;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
  
    button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
    }
  
    .error {
      text-align: center;
      color: #ff8888;
      margin-bottom: 15px;
    }
  </style>
  