<!-- Tabs.svelte -->
<script lang="ts">
  let { 
    tabs = [],
    activeTab = $bindable(tabs[0])
  } = $props();
</script>

<div class="tabs-container" style="overflow:hidden; overflow: auto;">
  {#each tabs as tab}
    <button 
      class="tab-button" 
      class:active={activeTab === tab} 
      onclick={() => activeTab = tab}
    >
      {tab}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }

  .tab-button {
    background: none;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    cursor: pointer;
    color: #64748b;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .tab-button:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  .tab-button.active {
    background-color: #e2e8f0;
    color: #0f172a;
    font-weight: bold;
  }
</style>