<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { api, setToken } from '$lib/services/api';
  import SiteGrid from '$lib/components/SiteGrid.svelte';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let loggedIn = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;
    try {
      const res = await api.auth.login(email, password);
      if (!res.token) throw new Error(res.error ?? 'Login failed');
      setToken(res.token);
      loggedIn = true;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }
</script>

{#if loggedIn}
  <div style="max-width: 800px; margin: 0 auto; padding: 64px 32px; box-sizing: border-box; text-align: center;">
    <h1 style="
      font-family: {S.fontHeadline};
      font-size: 28px;
      font-weight: 800;
      color: {COLORS.ink};
      margin: 0 0 12px 0;
    ">Signed In</h1>
    <p style="
      font-family: {S.fontBody};
      font-size: 14px;
      color: {COLORS.inkMuted};
      max-width: 480px;
      margin: 0 auto 40px auto;
      line-height: 1.6;
    ">Your account works across every Scribe Sheets site — pick a game below
      and sign in there to pick up where you left off.</p>
    <SiteGrid />
  </div>
{:else}
  <div style="
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    padding: 32px;
    box-sizing: border-box;
  ">
    <form
      onsubmit={handleSubmit}
      style="
        width: 100%;
        max-width: 400px;
        background-color: {COLORS.white};
        border: 1px solid {COLORS.outlineVar};
        border-radius: 8px;
        padding: 32px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 20px;
      "
    >
      <h1 style="
        font-family: {S.fontHeadline};
        font-size: 24px;
        font-weight: 800;
        color: {COLORS.ink};
        letter-spacing: -0.01em;
        margin: 0;
      ">Sign In</h1>

      <p style="
        font-family: {S.fontBody};
        font-size: 13px;
        color: {COLORS.inkMuted};
        margin: 0;
      ">Enter your credentials to access Scribe Sheets.</p>

      {#if error}
        <div style="
          padding: 10px 14px;
          background-color: #ffdad6;
          border: 1px solid {COLORS.red};
          border-radius: 4px;
          font-family: {S.fontBody};
          font-size: 12px;
          color: {COLORS.red};
        ">{error}</div>
      {/if}

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="email" style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          style="
            padding: 10px 12px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            background-color: {COLORS.bgLow};
            outline: none;
            box-sizing: border-box;
            width: 100%;
          "
        />
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label for="password" style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          style="
            padding: 10px 12px;
            border: 1px solid {COLORS.outlineVar};
            border-radius: 4px;
            font-family: {S.fontBody};
            font-size: 14px;
            color: {COLORS.ink};
            background-color: {COLORS.bgLow};
            outline: none;
            box-sizing: border-box;
            width: 100%;
          "
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style="
          padding: 12px;
          border: none;
          border-radius: 4px;
          background-color: {loading ? COLORS.inkMuted : COLORS.red};
          color: {COLORS.white};
          font-family: {S.fontBody};
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: {loading ? 'not-allowed' : 'pointer'};
          transition: background-color 0.15s ease;
        "
      >{loading ? 'Signing in...' : 'Sign In'}</button>

      <div style="
        text-align: center;
        font-family: {S.fontBody};
        font-size: 12px;
        color: {COLORS.inkMuted};
      ">
        Don't have an account?
        <a href="/auth/register" style="color: {COLORS.red}; text-decoration: underline;">Create one</a>
      </div>

      <a href="/" style="
        font-family: {S.fontBody};
        font-size: 12px;
        color: {COLORS.inkMuted};
        text-align: center;
        text-decoration: underline;
      ">Back to home</a>
    </form>
  </div>
{/if}
