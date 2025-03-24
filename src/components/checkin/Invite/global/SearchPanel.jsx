import React from 'react'

const SearchPanel = ({handleSearch, setSearch, search}) => {
    return (
        <div className='flex justify-end items-end gap-3 w-full mt-2'>
            <div className='flex justify-end items-center gap-3 w-full'>
                <div className="relative w-full max-w-[35.6rem] text-black">
                    <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                        <svg
                            viewBox="0 0 24 24"
                            className={`h-4 w-4 fill-current`}
                        >
                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                        </svg>
                    </span>
                    <input
                        placeholder="Search (Name OR Email)"
                        className={` bg-white rounded-md border border-primary border-b block pl-8 px-6 py-4 w-full outline-none placeholder:text-primary text-sm focus:ring-0 focus:ring-offset-0`}
                        onChange={(e) => {
                            e.preventDefault();
                            setSearch(e.target.value);
                        }}
                        value={search}
                    />
                </div>
                <button onClick={handleSearch} className='border-2 text-text-inactive hover:text-text border-border px-6 py-3 rounded-md text-[1.1rem] hover:bg-white/5 transition ease-in-out duration-150'>Search</button>
            </div>
        </div>
    )
}

export default SearchPanel
