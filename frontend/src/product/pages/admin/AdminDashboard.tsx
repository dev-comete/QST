import { useDashboard } from "../../../other/hooks/dashboard/useDashboard";
import Box from "../../../system/atoms/Container/Box";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import DashboardBloc from "../../../system/organisms/dashboard/container/DashboardBloc";
import { RecentQuizItem, SessionsItem } from "../../../system/organisms/dashboard/container/DashboardItems";
import InteractiveEvolutionChart from "../../../system/organisms/dashboard/container/InteractiveEvolutionChart";
import { DashboardStat } from "../../../system/organisms/dashboard/list/DashboardStat";
import BodyLayout from "../../layout/common/BodyLayout";
import NavigationBar from "../../../system/molecules/Navigation/NavigationBar";
import { useTabNavigation } from "../../../other/hooks/navigation/useTabNavigation";

const AdminDashboard = () => {

    const { metric, metricPending } = useDashboard()
    const { activeTab, handleTabChange } = useTabNavigation();

    if (metricPending) return <Loading />

    if (!metric) return <FetchError />

    return (
        <BodyLayout
            title="Tableau de bord"
        >
            <NavigationBar
                titles={['Global', 'Quiz et Sessions']}
                activeTab={activeTab}
                onTabChange={handleTabChange}           
            >
                {/* Global Tab */}
                {activeTab === 0 && (
                    <>
                        <DashboardStat stats={metric.stats}/>
                        <InteractiveEvolutionChart />
                    </>
                )}
                
                {/* Quiz et vague Tab */}
                {activeTab === 1 && (
                    <Box>
                        <DashboardBloc 
                            title="Suivi des quiz récents"
                            emptyText="Aucun quiz"
                            data={metric.recentQuizzes}
                            Item={RecentQuizItem}
                        />
                        <DashboardBloc 
                            title="Prochaines sessions"
                            emptyText="Aucune session à venir"
                            data={metric.upcomingSessions}
                            Item={SessionsItem}
                        />
                    </Box>
                )}
            </NavigationBar>
        </BodyLayout>
    )
}

export default AdminDashboard;