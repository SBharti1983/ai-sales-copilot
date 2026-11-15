FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["AISalesCopilot.API/AISalesCopilot.API.csproj", "AISalesCopilot.API/"]
COPY ["AISalesCopilot.Core/AISalesCopilot.Core.csproj", "AISalesCopilot.Core/"]
COPY ["AISalesCopilot.Infrastructure/AISalesCopilot.Infrastructure.csproj", "AISalesCopilot.Infrastructure/"]
RUN dotnet restore "AISalesCopilot.API/AISalesCopilot.API.csproj"
COPY . .
RUN dotnet build "AISalesCopilot.API/AISalesCopilot.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AISalesCopilot.API/AISalesCopilot.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AISalesCopilot.API.dll"]
