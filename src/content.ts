interface APIResponse {
  opportunityData?: any;
  error?: string;
}

const baseUrl = 'https://api.sam.gov/prod/opportunities/v2/search'
const opportunitiesDataLimit = 1000;

function getNoticeId(): string | null {
  const url = window.location.href;
  const match = url.match(/\/opp\/([a-f0-9]+)\//);
  return match ? match[1] : null;
}

function buildUrl(baseUrl: string, params: Record<string, string | number>) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  return url.toString();
}

/* 
  Fetches data from the SAM API.
  - First use the solnum in the parent document to fetch data.
  - If no results are found with solnum, it tries to fetch data using 
    noticeid derived fom the current SAM.gov URL.
*/

async function fetchAPIData(solnum: string): Promise<APIResponse> {
  try {
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    if (!apiKey) return { error: 'API key not set' };

    let response;
    const withSolnumUrl = buildUrl(baseUrl, {
      solnum,
      api_key: apiKey,
      limit: opportunitiesDataLimit
    });

    response = await fetch(withSolnumUrl);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    let data = await response.json();
    const noticeid = getNoticeId();

    if (data.opportunitiesData && data.opportunitiesData.length === 0 && noticeid) {
      console.log("No results found with solnum. Trying with noticeid...");
      const withNoticeIdUrl = buildUrl(baseUrl, {
        noticeid,
        api_key: apiKey,
        limit: opportunitiesDataLimit
      });
      response = await fetch(withNoticeIdUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      data = await response.json();
    }
    return { opportunityData: data };
  } catch (error: any) {
    return { error: error.message };
  }
}

function getSolicitationNumber(): string | null {
  const headerDivs = document.querySelectorAll('.header');
  for (const headerDiv of headerDivs) {
    if (headerDiv.textContent?.trim() === 'Notice ID') {
      const descriptionDiv = headerDiv.nextElementSibling;
      if (descriptionDiv && descriptionDiv.classList.contains('description')) {
        return descriptionDiv.textContent?.trim() || null;
      }
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSolicitationNumber") {
    const solicitationNumber = getSolicitationNumber();
    sendResponse({ solicitationNumber });
    return;
  }

  if (request.action === "fetchData" && request.solnum) {
    fetchAPIData(request.solnum).then(sendResponse);
    /* have to return true for chrome callback if async */
    return true;
  }
});
