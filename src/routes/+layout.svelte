<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  import type { User as FirebaseUser } from 'firebase/auth';
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import {user} from '$lib/store';
    
  interface User extends FirebaseUser {
    role?: string;
  };

  // hear ye hear ye, I do declare
  

  onMount(() => {
   
    onAuthStateChanged(auth, (u) => {
    $user = u;
    console.log(u);
  });
  });  
  export const prerender = true
</script>

<div class="parallax" ></div>
<div class="nav">
  <NavBar/>
  <slot/>
  
</div>


<style>
  .parallax {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    /*background-image: url('/caback.webp');*/
    background-color: black;
    background-size: cover;
    background-position: top;
    background-attachment: fixed;
    z-index: -1;
  }

  .content {
    position: relative;
    z-index: 1;
    backdrop-filter: blur(2px);
    background-color: rgba(0, 0, 0, .5);
    margin: 1vmax;
    border: 1px solid rgba(255, 255, 255, .5);
    padding: 1vmax;
    display: flex;
    columns: 2;
  }
</style>


  
