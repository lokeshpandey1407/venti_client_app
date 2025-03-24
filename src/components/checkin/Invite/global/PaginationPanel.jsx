import React from 'react'

const PaginationPanel = ({pages, page, searchIndicator, handlePreviousClick, handleNextClick}) => {
    return (
        <>
            {pages > 1 && !searchIndicator && <div className="flex items-center justify-end w-full space-x-2 p-4">
                <button
                    className=" text-text-inactive hover:text-text transition ease-in-out duration-150 "
                    disabled={page === 1}
                    onClick={handlePreviousClick}
                >
                    <svg viewBox="-0.5 0 25 25" width="2rem" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13.4092 16.4199L10.3492 13.55C10.1935 13.4059 10.0692 13.2311 9.98425 13.0366C9.89929 12.8422 9.85547 12.6321 9.85547 12.4199C9.85547 12.2077 9.89929 11.9979 9.98425 11.8035C10.0692 11.609 10.1935 11.4342 10.3492 11.29L13.4092 8.41992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M7 21.4202H17C19.2091 21.4202 21 19.6293 21 17.4202V7.42017C21 5.21103 19.2091 3.42017 17 3.42017H7C4.79086 3.42017 3 5.21103 3 7.42017V17.4202C3 19.6293 4.79086 21.4202 7 21.4202Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </button>

                <div className='flex flex-col justify-center items-center text-center'>
                    <p className='text-white'>{page} of {pages}</p>
                    <p className='text-[0.6rem] mt-[-0.2rem]'>Pages</p>
                </div>

                <button
                    className="text-text-inactive hover:text-text transition ease-in-out duration-150 "
                    disabled={page === pages}
                    onClick={handleNextClick}
                >
                    <svg viewBox="-0.5 0 25 25" fill="none" width="2rem" xmlns="http://www.w3.org/2000/svg" title="next"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.5605 8.41992L13.6205 11.29C13.779 11.4326 13.9056 11.6068 13.9924 11.8015C14.0791 11.9962 14.1239 12.2068 14.1239 12.4199C14.1239 12.633 14.0791 12.8439 13.9924 13.0386C13.9056 13.2332 13.779 13.4075 13.6205 13.55L10.5605 16.4199" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M17 3.41992H7C4.79086 3.41992 3 5.21078 3 7.41992V17.4199C3 19.6291 4.79086 21.4199 7 21.4199H17C19.2091 21.4199 21 19.6291 21 17.4199V7.41992C21 5.21078 19.2091 3.41992 17 3.41992Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </button>
            </div>}
        </>
    )
}

export default PaginationPanel
