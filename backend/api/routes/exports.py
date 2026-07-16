from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import json
import redis
from backend.core.config import settings

router = APIRouter()
redis_client = redis.from_url(settings.REDIS_URL)

@router.get("/{report_id}/csv")
def export_report_csv(report_id: str):
    """
    Export the AI report as a CSV string (Mocked for now).
    """
    report_data = redis_client.get(f"report_data:{report_id}")
    if not report_data:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report = json.loads(report_data)
    
    csv_content = "Category,Item\n"
    csv_content += f"Company,{report['company']['name']}\n"
    csv_content += f"Domain,{report['company']['domain']}\n"
    
    for strength in report['analysis']['swot']['strengths']:
        csv_content += f"Strength,{strength}\n"
        
    for weakness in report['analysis']['swot']['weaknesses']:
        csv_content += f"Weakness,{weakness}\n"
        
    for pain in report['analysis']['pain_points']:
        csv_content += f"Pain Point,\"{pain['problem']} - {pain['evidence']}\"\n"
        
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=report_{report_id}.csv"})
