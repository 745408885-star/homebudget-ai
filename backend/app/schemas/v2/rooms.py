from pydantic import BaseModel, ConfigDict, Field

from app.models import DemandLevel
from app.schemas.v2.common import RoomType


class Room(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    room_type: RoomType
    room_name: str = Field(min_length=1)
    area: float | None = Field(default=None, gt=0)
    resident_count: int = Field(default=0, ge=0)
    usage_frequency: DemandLevel = DemandLevel.MEDIUM
