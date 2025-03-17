"use client"; // Ensure the component is client-side

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // To manage session (check if user is logged in)
import { redirect } from "next/navigation"; // Use the `redirect` function from `next/navigation`

const CustomView = () => {
  const [data, setData] = useState<any[]>([]); // State to store fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [countdown, setCountdown] = useState(5); // Countdown timer state
  const [error, setError] = useState<string | null>(null); // State for timeout or error messages
  const { data: session } = useSession(); // Fetch session data

  useEffect(() => {
    const fetchData = async () => {
      // Make sure the user is logged in (you can also verify session on the server side in the API route)
      if (!session) {
        alert("Please log in to view the data");
        return;
      }

      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject("Timeout: Request took too long"), 3000) // Timeout after 3 seconds
        );

        const response = await Promise.race([
          fetch("/api/customview"), // API call to fetch data
          timeout, // Race between fetch and timeout
        ]);

        if (!response.ok) {
          throw new Error("Error fetching data");
        }
        const result = await response.json();
        setData(result); // Store the data in the state
      } catch (error: any) {
        console.error("Error:", error);
        setError(error.message); // Set error message if the fetch fails or times out
      } finally {
        setLoading(false); // Set loading to false once data is fetched or failed
      }
    };

    fetchData();
  }, [session]); // Dependency on session to trigger effect when session is available

  // Redirect to login page after countdown if no data is available
  useEffect(() => {
    if (data.length === 0 && !loading && !error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            redirect("/dashboard"); // Redirect to login page when countdown ends
          }
          return prev - 1; // Decrease countdown by 1
        });
      }, 1000); // Update every second

      return () => clearInterval(timer); // Clear timer on component unmount
    }
  }, [data, loading, error]);

  // Render the loading state or data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Display error or timeout message
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <p>Redirecting to login in {countdown} seconds...</p>
      </div>
    );
  }

  // Display the data if available
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-6">Reports</h1>
      <p>Here are the financial reports from the custom view:</p>
      <table className="min-w-full table-auto border-collapse mt-4">
        <thead>
          <tr>
            <th className="border-b px-4 py-2">Month</th>
            <th className="border-b px-4 py-2">Transactions</th>
            <th className="border-b px-4 py-2">Invoiced Amount</th>
            <th className="border-b px-4 py-2">Collected Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="border-b px-4 py-2">{row["Mesec pružanja usluge"]}</td>
              <td className="border-b px-4 py-2">{row["Broj transakcija"]}</td>
              <td className="border-b px-4 py-2">{row["Fakturisan iznos"]}</td>
              <td className="border-b px-4 py-2">{row["Naplaćen iznos"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomView;
