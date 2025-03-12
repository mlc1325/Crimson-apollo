<script lang="ts">
  import { auth } from "$lib/firebase";
  import { user } from "$lib/store";
  import { slide } from "svelte/transition";
  import { tick } from "svelte";

  let showDropdown = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  function openDropdown() {
        showDropdown = true;
        clearTimeout(timeoutId); // Cancel any previous timeout
    }

    function closeDropdown() {
        timeoutId = setTimeout(() => {
            showDropdown = false;
        }, 500); // Set timeout for 2 seconds before closing
    }

    function cancelClose() {
        clearTimeout(timeoutId); // If hovered again, cancel closing
    }
</script>

<div class="navbar">
  {#if $user !== null}
  <button class="hamburger" on:click={openDropdown} on:mouseenter={openDropdown}>
    ☰
</button>

{#if showDropdown}
    <div 
        class="dropdown" 
        transition:slide={{ duration: 250 }}
        on:mouseenter={cancelClose}
        on:mouseleave={closeDropdown}
    >
        <a href="/">Home</a>
        <a href="/admin">Admin</a>
        <a href="/leasing">Leasing</a>
        <a href="/maintenance">Maintenance</a>
        <a href="/test">Test</a>
    </div>
{/if}
  {/if}

  <div class="title">
      <a href="/" class="brand">Crimson Apollo</a>
  </div>
  
  <div class="auth">
      {#if $user === null}
          <a href="/login" class="auth-link">Login</a>
          <a href="/register" class="auth-link">Register</a>
      {/if}
      {#if $user !== null}
          <button class="profile">CA</button>
          <button class="logout" on:click={async function handleLogout() {
              await auth.signOut();
          }}>Logout</button>
      {/if}
  </div>
</div>

<style>
  .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background-color: #333;
      color: white;
  }
  .hamburger {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
  }
  .dropdown {
      position: absolute;
      top: 50px;
      left: 10px;
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
  }
  .dropdown a {
      text-decoration: none;
      color: black;
      padding: 5px 10px;
      display: block;
  }
  .title {
      flex: 1;
      text-align: center;
  }
  .brand {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
  }
  .auth {
      display: flex;
      gap: 10px;
      align-items: center;
  }
  .auth-link {
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border: 1px solid white;
      border-radius: 5px;
  }
  .auth-link:hover {
      background-color: white;
      color: #333;
  }
  .profile, .logout {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
  }
  .logout:hover {
      text-decoration: underline;
  }
</style>
