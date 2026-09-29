import type { Dispatch, SetStateAction } from "react";
import Input from "../../atoms/Form/Input";
import FAIcon from "../../atoms/Icon/FAIcon";

interface SearchBarProps {
	placeholder?: string
	search?: string,
	setSearch: Dispatch<SetStateAction<string>>
}

const SearchBar = ({ placeholder, search, setSearch } : SearchBarProps) => {
	return (
		<Input
			id={"searchQuestion"}
			name={"searchQuestion"}
			type="search"
			placeholder={placeholder}
			onChange={(e) => setSearch(e.target.value)}
			endIcon={<FAIcon name={"search"} className="text-disabled"/>}
			value={search}	
		/>
	)
}

export default SearchBar;