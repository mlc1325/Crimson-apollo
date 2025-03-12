<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  import type { User as FirebaseUser } from 'firebase/auth';
  import '../app.css';
  import Login from '$lib/components/Login.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import {user} from '$lib/store';
   
  interface User extends FirebaseUser {
    role?: string;
  };

  // hear ye hear ye, I do declare
  let currentTheme: 'light' | 'dark' = 'light';
  let themes = ['light', 'dark'];
  let sidebarOpen = false;
  let darkMode = false;

  onMount(() => {
    // Check if we're on the login page
    
        
    // Handle theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    currentTheme = savedTheme || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Handle auth state
    onAuthStateChanged(auth, (u) => {
    $user = u;
    console.log(u);
    //if (!user && !isLoginPage) {
     // goto('/login');
   // } else if (user && isLoginPage) {
      //goto('/');
   // }
  });
  });  
</script>


<NavBar/>
{#if $user !== null}
  <slot/>
  {:else}
  <Login/>
{/if}



  
