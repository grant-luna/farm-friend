export default async function MainContent({ params }) {
  const searchId = params.searchId;
  const search = await fetch(`../fasterFastPeopleSearch/finddSearch/${searchId}`);


  return <h2>{JSON.stringify(params)}</h2>
}