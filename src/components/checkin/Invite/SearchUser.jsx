import React, { useContext, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";

import SearchPanel from "./global/SearchPanel";
import PaginationPanel from "./global/PaginationPanel";
import Loader from "../../../common/Loader";

const SearchUser = ({ showAlert }) => {
  const HOST = import.meta.env.VITE_BASE_URL;

  //   const { getEvent, getUsersForEvent, searchUser, getNumPages, changeUser } =
  //     useFirestore();
  const [loader, setLoader] = useState(true);
  const [users, setUsers] = useState([]);
  const [eventData, setEventData] = useState({});
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("user_id");
  const numPerPage = 8;
  const [pages, setPages] = useState(null);
  const [page, setPage] = useState(1);
  const [searchIndicator, setSearchIndicator] = useState(false);
  const location = useLocation();
  const [paramDetails, setParamDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eParam = searchParams.get("e") || "";

    if (eParam) {
      setParamDetails((prevDetails) => ({
        ...prevDetails,
        event: eParam,
      }));
      console.log(eParam);
    } else {
      alert("No event details attached");
      navigate("/verify");
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      if (!paramDetails.event) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/project/get-project/${
            paramDetails.event
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          alert("Some error occurred. Please try again");
        }
        const result = await response.json();
        if (isMounted) {
          console.log(result);
          if (result.success) {
            setEventData(result.data);
            await fetchUsers(result.data.id);
          } else {
            console.error("Error getting new event:", result.message);
            showAlert(result.message, "alert");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error:", error.message);
          showAlert(JSON.stringify(error), "alert");
        }
      }
    };

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [paramDetails.event]);

  //   useEffect(() => {
  //     if (eventData && eventData.id) {
  //       getNumPages(eventData.id, numPerPage).then((pages) => setPages(pages));
  //     }
  //   }, [eventData]);

  const fetchUsers = async (projectId) => {
    setLoader(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/project-attendee-pass/${projectId}/get-attendee-pass`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Some error occurred. Please try again");
      }

      const res = await response.json();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    // const fetchUsers = async () => {
    //   if (eventData && eventData.uid && search.trim() === "") {
    //     const result = await getUsersForEvent(
    //       eventData.uid,
    //       orderBy,
    //       page,
    //       numPerPage
    //     );
    //     setSearchIndicator(false);
    //     if (result.status === RESULT_STATUS.SUCCESS) {
    //       console.log("Got users without search:", result.data);
    //       getNumPages(eventData.uid, numPerPage)
    //         .then((pages) => {
    //           setPages(pages);
    //         })
    //         .catch((error) => {
    //           console.error("Error getting number of pages:", error);
    //         });
    //       setUsers(result.data);
    //     } else if (result.status === RESULT_STATUS.ERROR) {
    //       console.error("Error getting users for event:", result.message);
    //     }
    //   }
    // };
    // fetchUsers();
  }, [page, eventData, search, orderBy]);

  const handlePreviousClick = () => {
    if (page === 1) return;
    setPage((prev) => prev - 1);
  };

  const handleNextClick = () => {
    if (page === pages) return;
    setPage((prev) => prev + 1);
  };

  //   const handleSearch = async () => {
  //     const result = await searchUser(eventData.uid, search, orderBy, numPerPage);
  //     setSearchIndicator(true);
  //     if (result.status === RESULT_STATUS.SUCCESS) {
  //       console.log("Searched users:", result.data);
  //       setUsers(result.data);
  //     } else if (result.status === RESULT_STATUS.ERROR) {
  //       console.error("Error adding new event:", result.message);
  //       setSearch("");
  //     }
  //   };

  const toCamelCase = (str) => {
    const words = str.toLowerCase().split(" ");
    for (let i = 0; i < words.length; i++) {
      if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].slice(1);
      }
    }
    return words.join(" ");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(/(\d+)(?=(st|nd|rd|th))/, "$1$2");
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));

    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s/, "");
  };

  const handleEmailAction = async (isResend, userId, name, phone, email) => {
    setLoader(userId);
    try {
      const response = await fetch(`${HOST}/send-verify-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventId: eventData.uid,
          email,
          eventData: {
            subject: eventData.subject,
            title: eventData.title,
            dateTo: formatDate(eventData.dateTo.substring(0, 10)),
            timeTo: formatTime(eventData.dateTo.substring(11, 16)),
            dateFrom:
              eventData.dateFrom.substring(0, 10) ===
              eventData.dateTo.substring(0, 10)
                ? " "
                : `${formatDate(eventData.dateFrom.substring(0, 10))} - `,
            timeFrom:
              eventData.dateFrom.substring(11, 16) ===
                eventData.dateTo.substring(11, 16) &&
              eventData.dateFrom.substring(0, 10) ===
                eventData.dateTo.substring(0, 10)
                ? " "
                : `${formatTime(eventData.dateFrom.substring(11, 16))} - `,
            location: eventData.location,
          },
          userData: { name, phone },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        showAlert(`Email ${isResend ? "re" : ""}sent successfully`, "success");

        if (!isResend) {
          const updatedFields = { invite_code_status: true };
          const result = await changeUser(userId, updatedFields, eventData.uid);
          if (result.status === RESULT_STATUS.SUCCESS) {
            console.log("Changed user with ID:", result.data);
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.uid === result.data.uid ? result.data : user
              )
            );
          }
        }
      } else {
        console.error(
          `Failed to ${isResend ? "re" : ""}send email:`,
          response.statusText
        );
        showAlert(`Failed to ${isResend ? "re" : ""}send email`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(`Error ${isResend ? "re" : ""}sending email`, "error");
    }
    setLoader("");
  };

  const EmailStatusCell = ({ status, userId, name, phone, email }) => {
    return (
      <div className="flex flex-col items-start">
        {/* <span className="text-gray-500 mb-1">Unsent</span> */}
        <button
          onClick={() => handleEmailAction(status, userId, name, phone, email)}
          className={`w-[5.2rem] mx-2 ring-1 ring-white text-text rounded-md py-2 text-[0.9rem] ${
            status
              ? "hover:text-background-accent hover:ring-background-accent"
              : "hover:text-green-500 hover:ring-green-500"
          } transition duration-300 ease-in-out`}
        >
          <div className="flex w-full h-fit justify-start px-1.5 items-center gap-2">
            {loader === userId ? (
              <div
                className={`flex justify-center items-center w-full h-[0.9rem] ${
                  status ? "text-background-accent" : "text-green-500"
                }`}
              >
                <svg
                  width="2rem"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 60"
                >
                  <circle
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="15"
                    r="15"
                    cx="40"
                    cy="30"
                  >
                    <animate
                      attributeName="opacity"
                      calcMode="spline"
                      dur="2"
                      values="1;0;1;"
                      keySplines=".5 0 .5 1;.5 0 .5 1"
                      repeatCount="indefinite"
                      begin="-.4"
                    ></animate>
                  </circle>
                  <circle
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="15"
                    r="15"
                    cx="100"
                    cy="30"
                  >
                    <animate
                      attributeName="opacity"
                      calcMode="spline"
                      dur="2"
                      values="1;0;1;"
                      keySplines=".5 0 .5 1;.5 0 .5 1"
                      repeatCount="indefinite"
                      begin="-.2"
                    ></animate>
                  </circle>
                  <circle
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="15"
                    r="15"
                    cx="160"
                    cy="30"
                  >
                    <animate
                      attributeName="opacity"
                      calcMode="spline"
                      dur="2"
                      values="1;0;1;"
                      keySplines=".5 0 .5 1;.5 0 .5 1"
                      repeatCount="indefinite"
                      begin="0"
                    ></animate>
                  </circle>
                </svg>
              </div>
            ) : (
              <>
                <div
                  className={`${
                    status ? "text-background-accent" : "text-green-500"
                  } `}
                >
                  <svg
                    width="0.8rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <rect width="24" height="24" fill="none"></rect>{" "}
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
                        fill="currentColor"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                <p>{status ? "Resend" : "Send"}</p>
              </>
            )}
          </div>
        </button>
      </div>
    );
  };

  const redactEmail = (email) => {
    if (email) {
      const [localPart, domain] = email.split("@");
      const redactLength = Math.floor(localPart.length * 0.4);
      const redactedPart = "*".repeat(redactLength);
      const visiblePart = localPart.slice(0, localPart.length - redactLength);
      return `${visiblePart}${redactedPart}@${domain}`;
    }
  };

  const redactPhone = (phone) => {
    const redactLength = Math.floor(phone.length * 0.5);
    const redactedPart = "*".repeat(redactLength);
    const visiblePart1 = phone.slice(0, redactLength / 2);
    const visiblePart2 = phone.slice(
      redactLength / 2 + redactLength,
      phone.length
    );
    return `${visiblePart1}${redactedPart}${visiblePart2}`;
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "first_name",
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => redactEmail(row.original.email),
    },
    // {
    //   header: "Phone",
    //   accessorKey: "phone",
    //   cell: ({ row }) => redactPhone(row.original.phone),
    // },
    {
      header: "Invite code",
      accessorKey: "id",
    },
    {
      header: "Pass Status",
      accessorKey: "status",
    },
    // {
    //   header: "Invite Code",
    //   accessorKey: "invite_code_status",
    //   cell: ({ row }) => (
    //     <EmailStatusCell
    //       status={row.original.invite_code_status}
    //       userId={row.original.uid}
    //       name={row.original.name}
    //       phone={row.original.phone}
    //       email={row.original.email}
    //     />
    //   ),
    // },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleHeaderClick = (accessorKey) => {
    setOrderBy(accessorKey);
  };

  return (
    <div className="flex justify-start items-start xs:justify-start xs:items-start h-screen w-full text-text px-2 overflow-y-auto  bg-gradient-to-b from-primary to-primary-grad pb-[8rem] pt-[2rem]">
      <div className="flex flex-col justify-start text-start h-full px-8 w-full ">
        <h2 className="font-bold text-transparent bg-gradient-to-l from-gradient-left to-gradient-right bg-clip-text text-[3rem] w-full flex justify-start">
          Attendee List
        </h2>

        {/* <SearchPanel
          handleSearch={handleSearch}
          setSearch={setSearch}
          search={search}
        /> */}
        {loader ? (
          <Loader />
        ) : (
          <div className="flex flex-col justify-start items-center text-center min-h-[37rem]">
            <div className="h-fit mt-10  p-[2px] bg-gradient-to-b from-border-gradient-left to-border-gradient-right rounded-md w-full  overflow-hidden">
              <div className="w-full max-h-[38rem] h-full rounded-md overflow-x-auto bg-gradient-to-b from-primary to-primary-grad ">
                <table className="py-[2rem] w-full min-w-[50rem]">
                  <thead className="text-sm bg-gradient-to-b from-head-gradient-top to-head-gradient-bottom border-b-2 border-head-gradient-top font-semibold text-[1.1rem] sticky top-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="cursor-default">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`py-[1rem] text-left ${
                              header.column.columnDef.header === "Name" &&
                              "pl-8"
                            } pl-2`}
                            onClick={
                              header.column.columnDef.header === "Name" ||
                              header.column.columnDef.header === "Email" ||
                              header.column.columnDef.header === "Phone"
                                ? () =>
                                    handleHeaderClick(
                                      header.column.columnDef.accessorKey
                                    )
                                : null
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="text-left">
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`
                                                        py-[1rem]
                                                        font-roboto
                                                        font-normal
                                                        sm:text-[0.8rem]
                                                        md:text-[0.9rem]
                                                        lg:text-[1rem]
                                                        max-w-[10rem]
                                                        overflow-hidden
                                                        text-ellipsis
                                                        ${
                                                          cell.column.columnDef
                                                            .header === "Name"
                                                            ? "px-[1rem] pl-[1.3rem]"
                                                            : ""
                                                        }
                                                        ${
                                                          cell.column.columnDef
                                                            .header === "Email"
                                                            ? "py-[0.9rem] pr-[1rem]"
                                                            : ""
                                                        }
                                                        ${
                                                          cell.column.columnDef
                                                            .header ===
                                                          "Email Status"
                                                            ? "py-[0.9rem] pr-[1rem]"
                                                            : ""
                                                        }
                                                    `}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={table.getAllColumns().length}
                          className="text-center py-4"
                        >
                          No users available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <PaginationPanel
              pages={pages}
              searchIndicator={searchIndicator}
              page={page}
              handlePreviousClick={handlePreviousClick}
              handleNextClick={handleNextClick}
            />
            <div className="flex justify-between w-full items-center px-[2rem] py-12">
              <button
                onClick={() => navigate(`/invite-code?e=${paramDetails.event}`)}
              >
                <p className="font-roboto font-bold text-[0.9rem] text-text-inactive hover:text-text transition duration-150 ease-in-out">
                  Go back to <b className="underline">Invite Code Page</b>
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUser;
