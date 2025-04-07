import { useState } from "react";
import axios from "axios";

export default function App() {
  const [baseUrl, setBaseUrl] = useState("https://superset.pvt.zluri.dev");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dashboardId, setDashboardId] = useState("");
  const [copyTitle, setCopyTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const copyDashboard = async () => {
    setLoading(true);
    setMessage("");

    try {
      const loginRes = await axios.post(`${baseUrl}/api/v1/security/login`, {
        username,
        password,
        provider: "db",
        refresh: true,
      });

      const accessToken = loginRes.data.access_token;

      const response = await axios.get(
        `${baseUrl}/api/v1/dashboard/${dashboardId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const result = response.data.result;
      const metadata = JSON.parse(result.json_metadata || "{}");
      const positions = JSON.parse(result.position_json || "{}");
      metadata.positions = positions;

      const copyPayload = {
        dashboard_title: copyTitle,
        duplicate_slices: false,
        json_metadata: JSON.stringify(metadata),
      };

      await axios.post(
        `${baseUrl}/api/v1/dashboard/${dashboardId}/copy/`,
        copyPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("✅ Dashboard copied successfully!");
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ Error: " +
          (err?.response?.data?.message || err?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Superset Dashboard Copier
        </h1>

        <div className="space-y-4">
          <InputField
            label="Superset Base URL"
            value={baseUrl}
            onChange={setBaseUrl}
          />
          <InputField
            label="Username"
            value={username}
            onChange={setUsername}
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <InputField
            label="Dashboard ID to Copy"
            value={dashboardId}
            onChange={setDashboardId}
          />
          <InputField
            label="New Dashboard Title"
            value={copyTitle}
            onChange={setCopyTitle}
          />

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            onClick={copyDashboard}
            disabled={loading}
          >
            {loading ? "Copying..." : "Copy Dashboard"}
          </button>

          {message && (
            <div
              className={`mt-4 text-sm p-3 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
