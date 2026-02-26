import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import OpenLandDetails from "@/components/properties/OpenLandDetails";
import { OpenLand } from "@/types/OpenLand";

const OpenLandDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 🔥 read already fetched lands from React Query cache
  const lands = queryClient.getQueryData<OpenLand[]>(["openLand"]);

  if (!lands) return <Loader />;

  const land = lands.find((l) => l._id === id);

  if (!land) {
    toast.error("Open land not found");
    navigate("/properties");
    return null;
  }

  return (
    <OpenLandDetails
      land={land}
      onBack={() => navigate("/properties")}
      onEdit={() => navigate(`/properties?editLand=${land._id}`)}
      onDelete={() => navigate("/properties")}
      onRefresh={() => {}}
    />
  );
};

export default OpenLandDetailsPage;
