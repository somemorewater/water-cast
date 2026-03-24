const saveBtn = document.getElementById("saveSettingsBtn");
const restoreBtn = document.getElementById("restoreDefaultsBtn");

const fields = {
  displayName: document.getElementById("displayName"),
  handle: document.getElementById("handle"),
  bio: document.getElementById("bio"),
  defaultCategory: document.getElementById("defaultCategory"),
  defaultVisibility: document.getElementById("defaultVisibility"),
  defaultQuality: document.getElementById("defaultQuality"),
  autoRecord: document.getElementById("autoRecord"),
  notifViewerMilestones: document.getElementById("notifViewerMilestones"),
  notifMentionsHighlights: document.getElementById("notifMentionsHighlights"),
  notifSystemHealth: document.getElementById("notifSystemHealth"),
  notifWeeklyDigest: document.getElementById("notifWeeklyDigest"),
  privacyFollowerOnlyChat: document.getElementById("privacyFollowerOnlyChat"),
  privacyRequireVerifiedEmail: document.getElementById("privacyRequireVerifiedEmail"),
  privacyAutoModeration: document.getElementById("privacyAutoModeration"),
};

const defaultSettings = {
  streamDefaults: {
    category: "Tech & Coding",
    visibility: "Public",
    quality: "1080p",
    autoRecord: false,
  },
  notifications: {
    viewerMilestones: true,
    mentionsHighlights: true,
    systemHealth: true,
    weeklyDigest: false,
  },
  privacy: {
    followerOnlyChat: false,
    requireVerifiedEmail: true,
    autoModeration: true,
  },
};

const applySettingsToForm = (data) => {
  const { user, settings } = data;

  if (fields.displayName) {
    fields.displayName.value = user?.displayName || user?.username || "";
  }
  if (fields.handle) {
    fields.handle.value = user?.handle || "";
  }
  if (fields.bio) {
    fields.bio.value = user?.bio || "";
  }

  const streamDefaults = settings?.streamDefaults || defaultSettings.streamDefaults;
  if (fields.defaultCategory) fields.defaultCategory.value = streamDefaults.category || "Tech & Coding";
  if (fields.defaultVisibility) fields.defaultVisibility.value = streamDefaults.visibility || "Public";
  if (fields.defaultQuality) {
    fields.defaultQuality.value =
      streamDefaults.quality === "1080p"
        ? "1080p (Recommended)"
        : streamDefaults.quality || "1080p (Recommended)";
  }
  if (fields.autoRecord) fields.autoRecord.checked = Boolean(streamDefaults.autoRecord);

  const notifications = settings?.notifications || defaultSettings.notifications;
  if (fields.notifViewerMilestones)
    fields.notifViewerMilestones.checked = Boolean(notifications.viewerMilestones);
  if (fields.notifMentionsHighlights)
    fields.notifMentionsHighlights.checked = Boolean(notifications.mentionsHighlights);
  if (fields.notifSystemHealth)
    fields.notifSystemHealth.checked = Boolean(notifications.systemHealth);
  if (fields.notifWeeklyDigest)
    fields.notifWeeklyDigest.checked = Boolean(notifications.weeklyDigest);

  const privacy = settings?.privacy || defaultSettings.privacy;
  if (fields.privacyFollowerOnlyChat)
    fields.privacyFollowerOnlyChat.checked = Boolean(privacy.followerOnlyChat);
  if (fields.privacyRequireVerifiedEmail)
    fields.privacyRequireVerifiedEmail.checked = Boolean(privacy.requireVerifiedEmail);
  if (fields.privacyAutoModeration)
    fields.privacyAutoModeration.checked = Boolean(privacy.autoModeration);
};

const collectSettingsFromForm = () => ({
  displayName: fields.displayName?.value || "",
  handle: fields.handle?.value || "",
  bio: fields.bio?.value || "",
  settings: {
    streamDefaults: {
      category: fields.defaultCategory?.value || "Tech & Coding",
      visibility: fields.defaultVisibility?.value || "Public",
      quality: (fields.defaultQuality?.value || "1080p").replace(" (Recommended)", ""),
      autoRecord: Boolean(fields.autoRecord?.checked),
    },
    notifications: {
      viewerMilestones: Boolean(fields.notifViewerMilestones?.checked),
      mentionsHighlights: Boolean(fields.notifMentionsHighlights?.checked),
      systemHealth: Boolean(fields.notifSystemHealth?.checked),
      weeklyDigest: Boolean(fields.notifWeeklyDigest?.checked),
    },
    privacy: {
      followerOnlyChat: Boolean(fields.privacyFollowerOnlyChat?.checked),
      requireVerifiedEmail: Boolean(fields.privacyRequireVerifiedEmail?.checked),
      autoModeration: Boolean(fields.privacyAutoModeration?.checked),
    },
  },
});

const loadSettings = async () => {
  try {
    const payload = await window.WatercastApi.fetchJson("/api/settings");
    applySettingsToForm(payload);
  } catch (err) {
    console.warn("Failed to load settings", err);
    await window.WatercastUI?.alert("Please log in to access settings.");
    window.location.href = "login.html";
  }
};

const saveSettings = async () => {
  try {
    window.WatercastUI?.setButtonLoading(saveBtn, true, "Saving...");
    await window.WatercastApi.fetchJson("/api/settings", {
      method: "PUT",
      body: JSON.stringify(collectSettingsFromForm()),
    });
    window.WatercastUI?.setButtonLoading(saveBtn, false);
    window.WatercastUI?.toast("Settings saved!", "success");
  } catch (err) {
    window.WatercastUI?.setButtonLoading(saveBtn, false);
    await window.WatercastUI?.alert(err.message || "Unable to save settings.");
  }
};

const restoreDefaults = async () => {
  applySettingsToForm({ user: {}, settings: defaultSettings });
  await saveSettings();
};

if (saveBtn) {
  saveBtn.addEventListener("click", saveSettings);
}

if (restoreBtn) {
  restoreBtn.addEventListener("click", restoreDefaults);
}

if (window.WatercastApi.getToken()) {
  loadSettings();
} else {
  (async () => {
    await window.WatercastUI?.alert("Please log in to access settings.");
    window.location.href = "login.html";
  })();
}
