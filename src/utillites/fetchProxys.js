const fetchThroughProxys = async () => {
  const PROXY_TOKEN = process.env.PROXY_TOKEN;
  const url = new URL('https://proxy.webshare.io/api/v2/proxy/list/');
  url.searchParams.append('mode', 'direct');
  url.searchParams.append('page', '1');
  url.searchParams.append('page_size', '10');

  const req = await fetch(url.href, {
    method: 'GET',
    headers: {
      Authorization: `Token ${PROXY_TOKEN}`,
    },
  });

  const res = await req.json();
  return res;
};

export default fetchThroughProxys;
