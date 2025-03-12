<script lang="ts">
    import { onMount } from 'svelte';
    
    let currentTheme: string;
    const themes = ['light', 'dark', 'cupcake', 'retro', 'cyberpunk', 'valentine', 'aqua'];

    function setTheme(theme: string) {
        currentTheme = theme;
        // This line is crucial for DaisyUI theme switching
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    onMount(() => {
        // Get theme from localStorage or use default
        currentTheme = localStorage.getItem('theme') || 'light';
        // Important: Actually apply the theme
        setTheme(currentTheme);
    });
</script>

<div class="card bg-base-200 shadow-xl p-4 max-w-md mx-auto">
    <div class="card-body">
        <h2 class="card-title mb-4">Theme Settings</h2>
        <div class="join join-vertical w-full">
            {#each themes as theme}
                <input 
                    type="radio" 
                    name="theme-buttons" 
                    class="btn join-item theme-controller" 
                    aria-label={theme}
                    checked={currentTheme === theme}
                    on:change={() => setTheme(theme)}
                />
                <div class="collapse collapse-arrow join-item border border-base-300">
                    <input type="radio" name="theme-accordion" checked={currentTheme === theme} /> 
                    <div class="collapse-title text-xl font-medium capitalize">
                        {theme}
                    </div>
                    <div class="collapse-content"> 
                        <div class="preview border-base-300 bg-base-100 rounded-b-box rounded-tr-box flex min-h-[6rem] min-w-[18rem] flex-wrap items-center justify-center gap-2 overflow-x-hidden border bg-cover bg-top p-4">
                            <button class="btn">Button</button>
                            <button class="btn btn-primary">Primary</button>
                            <button class="btn btn-secondary">Secondary</button>
                            <button class="btn btn-accent">Accent</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>