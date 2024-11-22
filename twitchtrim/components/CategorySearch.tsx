import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface CategorySearchResult {
	id: string;
	name: string;
	boxArtUrl: string;
}

interface CategorySearchProps {
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
}

const ERROR_MESSAGES = {
	SEARCH_FAILED: "Unable to search categories. Please try again.",
};

export default function CategorySearch({
	value,
	onChange,
	required = false,
}: CategorySearchProps) {
	const [query, setQuery] = useState(value);
	const [suggestions, setSuggestions] = useState<CategorySearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [error, setError] = useState("");
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const componentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setQuery(value);
	}, [value]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				componentRef.current &&
				!componentRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const searchCategories = async (searchQuery: string) => {
		if (!searchQuery) {
			setSuggestions([]);
			return;
		}

		setIsLoading(true);
		setError("");
		try {
			const response = await fetch(
				`/api/search-categories?query=${encodeURIComponent(searchQuery)}`,
			);
			if (!response.ok) {
				throw new Error(ERROR_MESSAGES.SEARCH_FAILED);
			}
			const data = (await response.json()) as CategorySearchResult[];
			setSuggestions(data);
		} catch (error) {
			console.error("Failed to fetch categories:", error);
			setSuggestions([]);
			setError(ERROR_MESSAGES.SEARCH_FAILED);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		setShowSuggestions(true);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			searchCategories(newQuery);
		}, 300);
	};

	const handleSuggestionClick = (suggestion: CategorySearchResult) => {
		setQuery(suggestion.name);
		onChange(suggestion.name);
		setSuggestions([]);
		setShowSuggestions(false);
	};

	const clearInput = () => {
		setQuery("");
		onChange("");
		setSuggestions([]);
		setShowSuggestions(false);
		setError("");
	};

	return (
		<div ref={componentRef} className="relative w-64">
			<div className="relative">
				<input
					type="text"
					value={query}
					onChange={handleInputChange}
					placeholder="Search Twitch categories..."
					required={required}
					className="w-full p-2.5 pl-10 rounded-lg bg-[#18181b] border border-[#2d2d2d] 
                             text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                             focus:ring-[#9147ff] focus:border-transparent"
				/>
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
				{query && (
					<button
						onClick={clearInput}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                                 hover:text-gray-300"
						type="button"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			{error && (
				<div className="absolute z-10 w-full mt-1 p-2 text-red-400 text-sm bg-red-900/20 rounded-lg">
					{error}
				</div>
			)}

			{showSuggestions && !error && (suggestions.length > 0 || isLoading) && (
				<div
					className="absolute z-10 w-full mt-1 bg-[#18181b] border border-[#2d2d2d] 
                            rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{isLoading ? (
						<div className="p-3 text-gray-400 text-center">Loading...</div>
					) : (
						suggestions.map((suggestion) => (
							<button
								key={suggestion.id}
								onClick={() => handleSuggestionClick(suggestion)}
								className="w-full p-2 flex items-center gap-3 hover:bg-[#2d2d2d] text-left"
								type="button"
							>
								<img
									src={suggestion.boxArtUrl
										.replace("{width}", "40")
										.replace("{height}", "54")}
									alt={suggestion.name}
									className="w-10 rounded"
								/>
								<span className="text-white">{suggestion.name}</span>
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
}
