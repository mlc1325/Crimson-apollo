<script>
    import DeliLetter from "$lib/components/DeliLetter.svelte";

</script>


<DeliLetter/>

<style>
    /* Create a neon animated background on the body */
body::before {
  content: "";
  position: fixed;             /* Fix it relative to the viewport */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;                 /* Place it behind all page content */
  
  /* An animated multi-color gradient with neon hues */
  background: linear-gradient(45deg, #00FF00, #ff00ff, #00ffff, #00FF00);
  background-size: 400% 400%;
  animation: neonBgAnimation 20s ease infinite;
  
  /* A blur filter and reduced opacity to simulate a soft neon glow */
  filter: blur(15px);
  opacity: 0.5;
}

/* Keyframes for the animated neon background */
@keyframes neonBgAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>