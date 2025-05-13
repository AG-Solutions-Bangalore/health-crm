export const getNavbarColors = (userPosition) => {
  switch(userPosition) {
    case "Hospital":
      return {
        
        buttonBg: "bg-blue-700",
        buttonHover: "hover:bg-blue-800",
        cardHeaderBg:"bg-blue-100",
        cardHeaderText:"text-blue-800"
      
      };
    case "Doctor":
      return {
      
        buttonBg: "bg-green-700",
        buttonHover: "hover:bg-green-800",
         cardHeaderBg:"bg-green-100",
        cardHeaderText:"text-green-800"
       
      };
    default:
      return {
       
        buttonBg: "bg-black",
        buttonHover: "hover:bg-gray-800 hover:text-white",
        cardHeaderBg:"bg-gray-200",
        cardHeaderText:"text-gray-800",
      };
  }
};
