
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Mining Redirect: Fetches the shortened URL from providers 
 * and redirects the user immediately to the target link bypass page.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Build the API endpoint for each provider
  switch(taskId) {
    case 1: apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; break;
    case 2: apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; break;
    case 3: apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; break;
    case 4: apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; break;
    case 5: apiUrl = `https://services.traffictot.com/api/v1/shorten?api=${task.apiKey}&url=${dest}`; break;
    case 6: apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; break;
  }

  if (!apiUrl) return;

  try {
    // Attempt to fetch the actual shortened link to avoid showing the raw JSON to the user
    const response = await fetch(apiUrl);
    const data = await response.json();

    let realLink = "";
    
    // Vendor-specific extraction
    if (data.status === "success" || data.success === true || data.shortenedUrl || data.link) {
      realLink = data.shortenedUrl || data.link || data.url || (data.data && data.data.shortenedUrl) || (data.html);
    }

    if (realLink) {
      window.location.href = realLink;
    } else {
      // Fallback: If JSON is weird, redirect to the API URL directly
      window.location.href = apiUrl;
    }
  } catch (error) {
    // CORS usually blocks silent fetch for some providers. 
    // If blocked, we MUST redirect directly to the API URL.
    window.location.href = apiUrl;
  }
};
