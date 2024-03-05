const fetchThroughProxys = async () => {
  const PROXY_TOKEN = process.env.PROXY_TOKEN;
  const PROXY_USER = process.env.PROXY_USER; // Username for proxy auth
  const PROXY_PASS = process.env.PROXY_PASS; // Password for proxy auth

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
  let ips = [];
  res?.results?.forEach((proxy) => {
    // Assuming the proxy expects credentials in the URL:
    const ip = {
      username: PROXY_USER,
      password: PROXY_PASS,
      ip: proxy?.proxy_address,
      port: proxy?.port,
    };
    ips.push(ip);
  });
  return ips;
};

export default fetchThroughProxys;
