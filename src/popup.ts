import 'prismjs';
import 'prismjs/components/prism-json';
import './styles/prism-patriotic.css';
import './styles/tailwind.css';

const apiKeyInfoUrl = 'https://open.gsa.gov/api/get-opportunities-public-api/#user-account-api-key-creation';

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const saveButton = document.getElementById('saveApiKey');
  const togglePasswordButton = document.getElementById('toggle-password');
  const fetchDataButton = document.getElementById('fetchData');
  const resultDiv = document.getElementById('result');
  const noticeIdDisplay = document.getElementById('noticeId');
  const loader = document.getElementById('loader');
  const eyeIcon = document.querySelector('#eye-icon');
  const eyeOffIcon = document.querySelector('#eye-off-icon');
  const apiKeyInfoIcon = document.getElementById('apiKeyInfo');
  const copyButton = document.getElementById('copyButton');
  const toast = document.getElementById('toast');


  function showToast() {
    if (toast) {
      toast.classList.remove('opacity-0');
      toast.classList.add('opacity-100');
      setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
      }, 3000);
    }
  }

  apiKeyInfoIcon?.addEventListener('click', () => {
    chrome.tabs.create({ url: apiKeyInfoUrl });
  });

  copyButton?.addEventListener('click', () => {
    if (resultDiv && resultDiv.textContent) {
      navigator.clipboard.writeText(resultDiv.textContent).then(() => {
        showToast();
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  });

  togglePasswordButton?.addEventListener("click", () => {
    const type = apiKeyInput.getAttribute("type") === "password" ? "text" : "password";
    apiKeyInput.setAttribute("type", type);
    eyeIcon?.classList?.toggle('hidden');
    eyeOffIcon?.classList?.toggle('hidden');
  });

  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (apiKey) {
    apiKeyInput.value = apiKey;
  }

  saveButton?.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({ apiKey }, () => {
      alert('API key saved!');
    });
  });

  fetchDataButton?.addEventListener('click', async () => {
    /* clear results */
    if (resultDiv) {
      resultDiv.innerHTML = '';
      resultDiv.classList.add('hidden');
    }
    if (noticeIdDisplay) {
      noticeIdDisplay.textContent = '';
    }
    if (copyButton) {
      copyButton.classList.add('hidden');
    }

    /* show loader */
    loader?.classList.remove('hidden');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "getSolicitationNumber" }, async (response) => {
        if (response?.solicitationNumber) {
          chrome.tabs.sendMessage(tab.id!, {
            action: "fetchData",
            solnum: response?.solicitationNumber,
          }, (response) => {
            loader?.classList.add('hidden');
            if (response.error) {
              if (resultDiv) {
                resultDiv.textContent = `Error: ${response.error}`;
                resultDiv.classList.remove('hidden');
              }
            } else {
              if (resultDiv) {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.className = 'language-json';
                code.textContent = JSON.stringify(response.opportunityData, null, 2);
                pre.appendChild(code);
                resultDiv.appendChild(pre);
                resultDiv.classList.remove('hidden');
                (window as any).Prism.highlightElement(code);
                copyButton?.classList.remove('hidden');
              }
            }
          });
        } else {
          console.error('Failed to get solicitation number.');
        }
      });
    }
  });
});
