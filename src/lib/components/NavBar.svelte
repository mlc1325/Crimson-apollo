<script lang="ts">
  import { auth } from "$lib/firebase";
  import { user } from "$lib/store";

  let isMobileMenuOpen = false;
  let showDropdown = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  async function handleLogout() {
    await auth.signOut();
  }
</script>

<nav class="outrageous-nav">
  <ul>
    {#if $user === null}
    <li><a href="/login"><i class="fas fa-user"></i> Login</a></li>
    <li><a href="/register"><i class="fas fa-user"></i> Register</a></li>
     
    {:else}
      <li><a href="/lettertool"><i class="fas fa-user"></i> Deli letter tool</a></li>
      <li><a href="/renttool"><i class="fas fa-user"></i> Subsidy tool</a></li>
      <li><a href="/analysis"><i class="fas fa-wrench"></i> Analysis</a></li>
      <li><a href="/admin"><i class="fas fa-envelope"></i> Admin</a></li>
      <li><a href="/login" class="nav.outrageous-nav a" on:click={handleLogout}>Logout</a></li>
    {/if}
  </ul>
</nav>

<style>/* DOS-Themed Navigation Styling */
  nav.outrageous-nav {
    background: #000;              /* Solid black background */
    border: 1px solid #00FF00;      /* Bright green border */
    padding: 10px 0;
  }
  
  nav.outrageous-nav ul {
    list-style: none;              /* Remove bullet points */
    margin: 0;
    padding: 0;
    display: flex;                 /* Horizontal layout */
    justify-content: center;       /* Center links horizontally */
    align-items: center;
    flex-wrap: wrap;               /* Allow wrapping on small screens */
  }
  
  nav.outrageous-nav li {
    margin: 0 15px;               /* Space out menu items */
    position: relative;
  }
  
  nav.outrageous-nav a {
    display: inline-block;
    padding: 8px 12px;                   /* Slightly reduced padding */
    font-size: 1.1em;                    /* Adjust font size for DOS look */
    font-family: "Courier New", Courier, monospace;  /* Classic DOS monospaced font */
    color: #00FF00;                      /* Bright green text */
    text-decoration: none;
    letter-spacing: 0.5px;
    background: #000;                     /* Matching black background */
    border: 1px solid #00FF00;           /* Green border for clear separation */
    transition: background 0.2s, color 0.2s;
  }
  
  /* Simple hover effect: invert colors */
  nav.outrageous-nav a:hover {
    background: #00FF00;
    color: #000;
  }
  
  /* Remove extra effects – no text-shadow, 3D transforms or animations */
  nav.outrageous-nav a i {
    display: inline-block;
    margin-right: 8px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 600px) {
    nav.outrageous-nav ul {
      flex-direction: column;    /* Stack menu items vertically */
    }
    nav.outrageous-nav li {
      margin: 10px 0;            /* Additional vertical spacing on small screens */
    }
    nav.outrageous-nav a {
      font-size: 1em;            /* Slightly smaller text for mobile */
    }
  }
  
</style>