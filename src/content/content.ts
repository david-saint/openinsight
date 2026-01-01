console.log('OpenInsight content script initialized.');

// Mount the shadow DOM container using dynamic import for code splitting
(async () => {
  try {
    const { mountContentApp } = await import('./mount');
    mountContentApp();
  } catch (error) {
    console.error('Failed to load OpenInsight content app:', error);
  }
})();
