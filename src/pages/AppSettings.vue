<template>
  <div>
    <header>
      <h1>Settings</h1>
    </header>
    <main>
      <p style="display: flex; flex-direction: column; gap: 0.5rem">
        <strong>OpenAI API key</strong>
        <a href="https://platform.openai.com/account/api-keys" target="_blank"
          >Click here to get your API key.</a
        >
      </p>
      <form @submit.prevent="void 0">
        <input
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          style="max-width: 20rem; text-overflow: ellipsis"
        />
        <button class="primary-btn" style="width: 6rem">Save</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-btn {
  border-radius: 10px;
  border: 2px solid #213547;
  display: flex;
  align-items: center;
  height: 2.5rem;
  font-weight: 500;
  width: 7.5rem;
  justify-content: center;
  transition: color 0.3s, background-color 0.3s;
  cursor: pointer;
}

.create-btn:hover {
  background-color: #213547;
  color: #f5f5f5;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

a {
  color: currentColor;
  text-underline-offset: 4px;
}
</style>
