export const addDomainToVercel = async (domain: string) => {
  const response = await fetch(
    `https://api.vercel.com/v10/projects/${
      process.env.VERCEL_PROJECT_ID
    }/domains${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''
    }`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    }
  )

  return response.json()
}

export const removeDomainFromVercel = async (domain: string) => {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${
      process.env.VERCEL_PROJECT_ID
    }/domains/${domain}${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''
    }`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
      method: 'DELETE',
    }
  )

  return response.json()
}

export const verifyDomainOnVercel = async (domain: string) => {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${
      process.env.VERCEL_PROJECT_ID
    }/domains/${domain}/verify${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''
    }`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.json()
}

export const getDomainResponse = async (domain: string) => {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${
      process.env.VERCEL_PROJECT_ID
    }/domains/${domain}${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''
    }`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.json()
}
