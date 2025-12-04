import useTheme from "../context/theme";
import { FaRegSun } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";



const ThemeButton = () => {
  const { themeMode, darkTheme, lightTheme } = useTheme();

  const onChangeBtn = (e) => {
    const darkModeStatus = e.currentTarget.checked;
    if (darkModeStatus) {
      darkTheme();
    } else {
      lightTheme();
    }
  };
  return (
    <label className="relative inline-flex items-center cursor-pointer pt-3">
      <input
        type="checkbox"
        onChange={onChangeBtn}
        checked={themeMode === "dark"}
        className="sr-only peer"
      />
      <div className="w-11 h-6 boader-white bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 after:mt-3"></div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
        {themeMode !== "dark" ? <FaRegSun className="text-yellow-500" /> : <FaMoon />}
      </span>
    </label>
  );
};

export default ThemeButton;