<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  
  let email = "";
  let password = "";
  let error = "";
  
  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<div class="card">
  <h2>Sign in to your account</h2>
  
  <form on:submit|preventDefault={handleLogin} class="login-form">
      <div class="form-group">
          <label for="email">Email address</label>
          <input bind:value={email} type="email" id="email" autocomplete="email" required>
      </div>

      <div class="form-group">
          <label for="password">Password</label>
          <input bind:value={password} type="password" id="password" autocomplete="current-password" required>
      </div>
      
      {#if error}
          <p class="error-message">{error}</p>
      {/if}
      
      <button on:click={() => window.location.href = '/'} type="submit" class="login-button">Sign in</button>
  </form>
</div>

<style>
    .card {
      width: auto;
      margin: 100px auto;
      padding: 2rem;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), 0 0 10px #ff3366;
      color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .card h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #ff3366;
      text-shadow: 0 0 8px #ff3366;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #bbb;
    }
    
    .form-group input {
        width: 100%;
        padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #ff3366;
      box-shadow: 0 0 12px rgba(255, 51, 102, 0.7);
    }
    
    .login-button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(90deg, #ff3366, #ff0044);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(255, 51, 102, 0.7);
      transition: transform 0.2s ease, box-shadow 0.3s ease;
    }
    
    .login-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 16px rgba(255, 51, 102, 1);
    }
    
    .error-message {
      margin-bottom: 1rem;
      color: #ff8888;
      text-align: center;
      font-size: 0.9rem;
    }
    </style>