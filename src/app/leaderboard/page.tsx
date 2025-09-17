import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard } from "@/services/leaderboardService";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  
  return (
    <div className="container py-8 md:py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl font-headline">
          Leaderboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          See who is at the top of the Game of Proverbs.
        </p>
      </section>

      <section className="mt-12 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.rank} className="text-lg">
                    <TableCell className="text-center font-bold">
                      {entry.rank <= 3 ? (
                        <Award
                          className={cn(
                            "inline-block h-8 w-8",
                            entry.rank === 1 && "fill-yellow-400 text-yellow-600",
                            entry.rank === 2 && "fill-gray-300 text-gray-500",
                            entry.rank === 3 && "fill-orange-400 text-orange-600"
                          )}
                        />
                      ) : (
                        entry.rank
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.avatar} alt={entry.name} />
                          <AvatarFallback>
                            {entry.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">{entry.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
