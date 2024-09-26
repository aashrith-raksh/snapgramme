import { account } from "@/lib/appwrite/config";

const Home = () => {
  return (
    <>
      <div>Home</div>
      <br />
      <button
        onClick={async () => {
          const res = await account.get();
          console.log(res);
        }}
      >
        get current user
      </button>
    </>
  );
};

export default Home;
