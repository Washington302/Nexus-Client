<script lang="ts">
  import type { Covenant } from '$lib/types/covenant';
  import { covenantData as covenant } from '$lib/data/covenant';
  import { Tabs, CovenantHeader, ChipList, Inhabitants, Library, Reputations, Finances, Possessions } from '$lib/components';
  import { COLORS } from '$lib/constants';
  import CovenantVis from '$lib/components/CovenantVis.svelte';

  const tabList = ['Inhabitants', 'Library', 'Possessions', 'Finances', 'Calendar', 'Vis Sources'];
  let activeTab = $state('Inhabitants');
</script>

<!-- 1. Outer Screen Wrapper: Centers the content and pushes it away from the browser edges -->
<div style="
  background-color: {COLORS.bg}; 
  min-height: 100vh; 
  box-sizing: border-box;
  display: flex; 
  justify-content: center; 
  padding: 32px;
">
  
  <!-- 2. Max-Width Container: Prevents the layout from stretching too wide on massive screens -->
  <div style="
    width: 100%; 
    display: flex; 
    flex-direction: column; 
    gap: 32px;
  ">
    
    <!-- Hero Header Area -->
    <header style="width: 100%;">
      <CovenantHeader {covenant} />
    </header>

    <!-- 3. Split Dashboard Layout: Side-by-side using CSS Grid -->
    <div style="
      display: grid; 
      grid-template-columns: 280px 1fr; 
      gap: 32px; 
      align-items: start;
    ">
      
      <!-- Left Column: Permanent Status Sidebar -->
      <aside style="
        background-color: {COLORS.bgLow}; 
        border: 1px solid rgba(51, 65, 85, 0.5); 
        padding: 24px; 
        border-radius: 16px; 
        display: flex; 
        flex-direction: column; 
        gap: 24px;
      ">
        <div>
          <ChipList 
            virtues={covenant.boons} 
            flaws={covenant.hooks} 
            virtuesLabel="Boons" 
            flawsLabel="Hooks" 
          />
        </div>
        
        <div style="border-top: 1px solid; margin: 4px 0;"></div>
        
        <div>
          <Reputations reputations={covenant.reputations} />
        </div>
      </aside>

      <!-- Right Column: Interactive Tab Area -->
      <section style="display: flex; flex-direction: column; gap: 20px; border: 1px solid; padding: 24px; border-radius: 16px;">
        
        <!-- Tab Bar Container -->
        <div style="
          padding: 8px; 
          border-radius: 12px; 
        ">
          <Tabs tabs={tabList} bind:activeTab={activeTab} />
        </div>

        <!-- Main Content Dynamic Window -->
        <main style="
          padding: 32px; 
          border-radius: 16px; 
          min-height: 500px;
          max-height: 500px;
          overflow-y: auto;
          scrollbar-width: none;
          box-sizing: border-box;
        ">
          {#if activeTab === 'Inhabitants'}
            <Inhabitants {covenant} /> 

          {:else if activeTab === 'Library'}
            <Library {covenant} />

          {:else if activeTab === 'Possessions'}
            <Possessions {covenant} />
          {:else if activeTab === 'Finances'}
          <Finances {covenant} />

          {:else if activeTab === 'Calendar'}
            <div style="color: #94a3b8;">Covenant timeline and seasonal activities.</div>
          {:else if activeTab === 'Vis Sources'}
          <CovenantVis {covenant} />
          {/if}
        </main>
      </section>

    </div>
  </div>
</div>