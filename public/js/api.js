window.WatercastApi = (() => {
  const base = window.WATERCAST_API || window.location.origin;

  const getToken = () => localStorage.getItem("watercast_token");
  const setToken = (token) => localStorage.setItem("watercast_token", token);
  const clearToken = () => localStorage.removeItem("watercast_token");

  const fetchJson = async (path, options = {}) => {
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${base}${path}`, {
      ...options,
      headers,
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = payload.message || "Request failed";
      throw new Error(message);
    }

    return payload;
  };

  return { base, getToken, setToken, clearToken, fetchJson };
})();
