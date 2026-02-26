import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";
import { OpenPlotDetails } from "@/components/properties/OpenPlotDetails";
import { toast } from "sonner";

const OpenPlotDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-plot", id],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/openPlot/getOpenPlot/${id}`,
        { withCredentials: true },
      );
      return res.data?.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Loader />;

  if (isError || !data) {
    toast.error("Failed to load open plot");
    navigate("/properties");
    return null;
  }

  return (
    <OpenPlotDetails
      plot={data}
      onEdit={() => navigate(`/properties?editPlot=${data._id}`)}
      onDelete={() => navigate("/properties")}
      onBack={() => navigate("/properties")}
    />
  );
};

export default OpenPlotDetailsPage;