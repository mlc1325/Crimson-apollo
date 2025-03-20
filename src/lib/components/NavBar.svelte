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

<style>
/* Base reset and layout for nav */
nav.outrageous-nav ul {
  list-style: none;            /* Remove bullet points */
  margin: 0;
  padding: 0;
  display: flex;               /* Horizontal layout */
  justify-content: center;     /* Center links horizontally */
  align-items: center;
  flex-wrap: wrap;             /* Allow wrapping on small screens */
}
nav.outrageous-nav li {
  margin: 0 15px;              /* Space out menu items */
  position: relative;          /* For positioning pseudo-elements if needed */
}
nav.outrageous-nav a {
  display: inline-block;
  padding: 10px 15px;
  font-size: 1.2em;            /* Slightly larger text for emphasis */
  font-family: "Arial", sans-serif;
  color: #FFF;                 /* Base text color (white for neon contrast) */
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;  /* Smooth hover effects */
  /* Enable 3D space for child elements (like icons) */
  transform-style: preserve-3d;
}


/* Outrageous background gradient for nav */
nav.outrageous-nav {
  /* Neon multicolor gradient background (animated) */
  background: linear-gradient(90deg, #ff00ff, #00ffff, #00ff00, #ffff00, #ff00ff);
  background-size: 400% 400%;           /* Expand gradient for animation */
  animation: bgAnimate 20s linear infinite;  /* Animate background colors */
  
  /* Glowing border that pulses between magenta and cyan */
  border: 4px solid magenta;
  animation: borderPulse 3s ease-in-out infinite alternate;
}

/* Neon glow text and box-shadow for links */
nav.outrageous-nav a {
  /* Neon text glow (multiple layers of text-shadow) */
  text-shadow: 
    0 0 5px #fff,      /* small white glow at core */
    0 0 10px #fff, 
    0 0 20px #0ff,     /* cyan outer glow */
    0 0 30px #0ff;
  /* Soft glowing box-shadow around each link */
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);  /* cyan glow */
  
  /* Slightly translucent background to improve contrast */
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

/* Intensify glow on hover (box-shadow) */
nav.outrageous-nav a:hover {
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.8); /* brighter magenta glow on hover */
}


/* 3D hover tilt and scale for links */
nav.outrageous-nav a:hover {
  transform: translateZ(10px) rotateX(15deg) scale(1.1);  /* pop out and tilt in 3D on hover */
}

/* Ensure back face isn't visible when rotated (in case of extreme tilt) */
nav.outrageous-nav a {
  backface-visibility: hidden;
}

/* Icon styling and hover animation */
nav.outrageous-nav a i {
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.6s ease;
}
nav.outrageous-nav a:hover i {
  transform: rotate(360deg);  /* spin icon a full circle on hover */
}


/* Keyframe: animated background gradient */
@keyframes bgAnimate {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Keyframe: pulsating border color (magenta <-> cyan) */
@keyframes borderPulse {
  from { border-color: magenta; }
  to   { border-color: cyan; }
}

/* Keyframe: neon text glow pulse (cyan <-> magenta) */
@keyframes neonGlow {
  0% {
    text-shadow: 
      0 0 5px #fff, 
      0 0 10px #fff, 
      0 0 20px #0ff, 
      0 0 30px #0ff;
  }
  100% {
    text-shadow: 
      0 0 5px #fff, 
      0 0 10px #f0f,  /* switch outer glow to magenta */
      0 0 20px #f0f, 
      0 0 30px #f0f;
  }
}

/* Apply neon glow pulsing animation to links */
nav.outrageous-nav a {
  animation: neonGlow 1.5s ease-in-out infinite alternate;
}


@media (max-width: 600px) {
  nav.outrageous-nav ul {
    flex-direction: column;    /* Stack menu items vertically */
  }
  nav.outrageous-nav li {
    margin: 10px 0;            /* add vertical spacing between items */
  }
  nav.outrageous-nav a {
    font-size: 1em;           /* slightly smaller text on mobile */
    transform: none;          /* disable any pre-set transform (if any) */
  }
}

</style>