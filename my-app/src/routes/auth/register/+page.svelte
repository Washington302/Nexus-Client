<script lang="ts">
  import { COLORS, S } from '$lib/constants';
  import { goto } from '$app/navigation';

  import { api, setToken } from '$lib/services/api';

  let username = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = null;

    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    loading = true;
    try {
      const res = await api.auth.register(username, email, password);
      if (!res.token) throw new Error(res.error ?? 'Registration failed');
      setToken(res.token);
      goto('/');
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }
</script>

<div style="
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: {COLORS.bg};
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
    ">Create Account</h1>

    <p style="
      font-family: {S.fontBody};
      font-size: 13px;
      color: {COLORS.inkMuted};
      margin: 0;
    ">Register a new NEXUS account.</p>

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
      <label for="reg-username" style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Username</label>
      <input
        id="reg-username"
        type="text"
        bind:value={username}
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
      <label for="reg-email" style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Email</label>
      <input
        id="reg-email"
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
      <label for="reg-password" style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Password</label>
      <input
        id="reg-password"
        type="password"
        bind:value={password}
        required
        minlength={6}
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
      <label for="reg-confirm" style="
        font-family: {S.fontBody};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {COLORS.inkMuted};
      ">Confirm Password</label>
      <input
        id="reg-confirm"
        type="password"
        bind:value={confirmPassword}
        required
        minlength={6}
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
    >{loading ? 'Registering...' : 'Create Account'}</button>

    <div style="
      text-align: center;
      font-family: {S.fontBody};
      font-size: 12px;
      color: {COLORS.inkMuted};
    ">
      Already have an account?
      <a href="/auth/login" style="color: {COLORS.red}; text-decoration: underline;">Sign in</a>
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
