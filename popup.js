document.getElementById('summarize-btn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  let selection = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  const text = selection[0].result.trim();
  const resultDiv = document.getElementById('result');

  if (!text) {
    resultDiv.innerText = "Please select some text on the page.";
    return;
  }

  resultDiv.innerText = "Summarizing...";

  const apiKey = "AIzaSyBTa_tyULnSj6VzaM44SozmLyECuPJDC0Y";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Please summarize this text:\n\n${text}` }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      // Network or auth issue
      resultDiv.innerText = `Error: ${response.status} ${response.statusText}`;
      console.error(`HTTP ${response.status}:`, await response.text());
      return;
    }

    const data = await response.json();
    console.log("API Response:", data);

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (summary) {
      resultDiv.innerText = summary;
    } else {
      resultDiv.innerText = "Error generating summary.";
      console.error("Unexpected API structure:", data);
    }
  } catch (error) {
    resultDiv.innerText = "Error contacting the API.";
    console.error("API Error:", error);
  }
});
